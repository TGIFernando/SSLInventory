const router = require('express').Router();
const db = require('../db');

const ORDER_ITEMS_SELECT = [
  'order_items.id',
  'order_items.order_id',
  'order_items.quantity',
  'items.id as item_id',
  'items.name as item_name',
  'items.unit',
];

const fetchOrderItems = (trx, orderId) =>
  trx('order_items')
    .join('items', 'order_items.item_id', 'items.id')
    .select(...ORDER_ITEMS_SELECT)
    .where('order_items.order_id', orderId);

/** Restore inventory for all items in an order (used on delete / before re-save on edit). */
const restoreInventory = async (trx, orderId) => {
  const rows = await trx('order_items').where({ order_id: orderId });
  for (const row of rows) {
    await trx('items').where({ id: row.item_id }).increment('quantity', row.quantity);
  }
};

/** Validate stock and deduct inventory for each item. Throws on insufficient stock. */
const deductInventory = async (trx, items) => {
  for (const item of items) {
    const inv = await trx('items').where({ id: item.item_id }).first();
    if (!inv) throw new Error(`Item ${item.item_id} not found`);
    if (inv.quantity < item.quantity) {
      throw new Error(
        `Insufficient stock for "${inv.name}" — ${inv.quantity} available, ${item.quantity} requested`,
      );
    }
    await trx('items').where({ id: item.item_id }).decrement('quantity', item.quantity);
  }
};

// GET /orders
router.get('/', async (req, res) => {
  try {
    const orders = await db('orders').orderBy('created_at', 'desc');
    // attach item count to each order
    const withCounts = await Promise.all(
      orders.map(async (o) => {
        const [{ cnt }] = await db('order_items').where({ order_id: o.id }).count('id as cnt');
        return { ...o, item_count: Number(cnt) };
      }),
    );
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await db('orders').where({ id: req.params.id }).first();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = await fetchOrderItems(db, req.params.id);
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /orders — creates order AND deducts inventory
router.post('/', async (req, res) => {
  try {
    const { order_name, client_name, phone, email, address, delivery_type, items } = req.body;
    if (!order_name || !client_name) {
      return res.status(400).json({ error: 'order_name and client_name are required' });
    }

    let result;
    await db.transaction(async (trx) => {
      const [id] = await trx('orders').insert({
        order_name,
        client_name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        delivery_type: delivery_type || null,
      });

      if (items && items.length > 0) {
        await deductInventory(trx, items);
        await trx('order_items').insert(
          items.map((item) => ({ order_id: id, item_id: item.item_id, quantity: item.quantity })),
        );
      }

      const order = await trx('orders').where({ id }).first();
      const orderItems = await fetchOrderItems(trx, id);
      result = { ...order, items: orderItems };
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /orders/:id — restores old inventory, applies new
router.put('/:id', async (req, res) => {
  try {
    const { order_name, client_name, phone, email, address, delivery_type, items } = req.body;

    let result;
    await db.transaction(async (trx) => {
      const existing = await trx('orders').where({ id: req.params.id }).first();
      if (!existing) throw new Error('Order not found');

      // Restore inventory for items being replaced
      await restoreInventory(trx, req.params.id);
      await trx('order_items').where({ order_id: req.params.id }).del();

      // Update the order record
      await trx('orders').where({ id: req.params.id }).update({
        order_name,
        client_name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        delivery_type: delivery_type || null,
        updated_at: trx.fn.now(),
      });

      // Insert new items and deduct inventory
      if (items && items.length > 0) {
        await deductInventory(trx, items);
        await trx('order_items').insert(
          items.map((item) => ({ order_id: req.params.id, item_id: item.item_id, quantity: item.quantity })),
        );
      }

      const order = await trx('orders').where({ id: req.params.id }).first();
      const orderItems = await fetchOrderItems(trx, req.params.id);
      result = { ...order, items: orderItems };
    });

    res.json(result);
  } catch (err) {
    const status = err.message === 'Order not found' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

// DELETE /orders/:id — restores inventory before deleting
router.delete('/:id', async (req, res) => {
  try {
    await db.transaction(async (trx) => {
      const order = await trx('orders').where({ id: req.params.id }).first();
      if (!order) throw new Error('Order not found');
      await restoreInventory(trx, req.params.id);
      await trx('orders').where({ id: req.params.id }).del();
    });
    res.status(204).send();
  } catch (err) {
    const status = err.message === 'Order not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;

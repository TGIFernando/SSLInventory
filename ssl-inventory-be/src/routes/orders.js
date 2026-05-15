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

/** Deduct inventory — throws with a clear message on insufficient stock. */
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

/** Restore inventory for all items on an order. */
const restoreInventory = async (trx, orderId) => {
  const rows = await trx('order_items').where({ order_id: orderId });
  for (const row of rows) {
    await trx('items').where({ id: row.item_id }).increment('quantity', row.quantity);
  }
};

const VALID_TRANSITIONS = {
  pending: ['complete'],
  complete: ['returned'],
  returned: [],
};

// GET /orders
router.get('/', async (req, res) => {
  try {
    const orders = await db('orders').orderBy('created_at', 'desc');
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

// POST /orders — creates as PENDING; no inventory change
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
        status: 'pending',
      });

      if (items && items.length > 0) {
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

// PUT /orders/:id — edit details/items; only allowed while PENDING (no inventory held yet)
router.put('/:id', async (req, res) => {
  try {
    const { order_name, client_name, phone, email, address, delivery_type, items } = req.body;

    let result;
    await db.transaction(async (trx) => {
      const existing = await trx('orders').where({ id: req.params.id }).first();
      if (!existing) throw new Error('Order not found');
      if (existing.status !== 'pending') {
        throw new Error('Only pending orders can be edited');
      }

      await trx('order_items').where({ order_id: req.params.id }).del();
      await trx('orders').where({ id: req.params.id }).update({
        order_name,
        client_name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        delivery_type: delivery_type || null,
        updated_at: trx.fn.now(),
      });

      if (items && items.length > 0) {
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

// PATCH /orders/:id/status — transition status with inventory side-effects
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    let result;
    await db.transaction(async (trx) => {
      const order = await trx('orders').where({ id: req.params.id }).first();
      if (!order) throw new Error('Order not found');

      const allowed = VALID_TRANSITIONS[order.status] || [];
      if (!allowed.includes(status)) {
        throw new Error(`Cannot transition from "${order.status}" to "${status}"`);
      }

      if (status === 'complete') {
        const orderItems = await trx('order_items').where({ order_id: req.params.id });
        await deductInventory(trx, orderItems.map((i) => ({ item_id: i.item_id, quantity: i.quantity })));
      }

      if (status === 'returned') {
        await restoreInventory(trx, req.params.id);
      }

      await trx('orders').where({ id: req.params.id }).update({ status, updated_at: trx.fn.now() });

      const updated = await trx('orders').where({ id: req.params.id }).first();
      const orderItems = await fetchOrderItems(trx, req.params.id);
      result = { ...updated, items: orderItems };
    });

    res.json(result);
  } catch (err) {
    const status = err.message === 'Order not found' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

// DELETE /orders/:id — restores inventory only if order was COMPLETE
router.delete('/:id', async (req, res) => {
  try {
    await db.transaction(async (trx) => {
      const order = await trx('orders').where({ id: req.params.id }).first();
      if (!order) throw new Error('Order not found');
      if (order.status === 'complete') {
        await restoreInventory(trx, req.params.id);
      }
      await trx('orders').where({ id: req.params.id }).del();
    });
    res.status(204).send();
  } catch (err) {
    const status = err.message === 'Order not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;

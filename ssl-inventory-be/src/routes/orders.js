const router = require('express').Router();
const db = require('../db');

const withItems = async (orderId) => {
  const items = await db('order_items')
    .join('items', 'order_items.item_id', 'items.id')
    .select(
      'order_items.id',
      'order_items.order_id',
      'order_items.quantity',
      'items.id as item_id',
      'items.name as item_name',
      'items.unit',
    )
    .where('order_items.order_id', orderId);
  return items;
};

router.get('/', async (req, res) => {
  try {
    const orders = await db('orders').orderBy('created_at', 'desc');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await db('orders').where({ id: req.params.id }).first();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = await withItems(req.params.id);
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { order_name, client_name, phone, email, address, items } = req.body;
    if (!order_name || !client_name) {
      return res.status(400).json({ error: 'order_name and client_name are required' });
    }

    const [id] = await db('orders').insert({
      order_name,
      client_name,
      phone: phone || null,
      email: email || null,
      address: address || null,
    });

    if (items && items.length > 0) {
      await db('order_items').insert(
        items.map((item) => ({
          order_id: id,
          item_id: item.item_id,
          quantity: item.quantity,
        })),
      );
    }

    const order = await db('orders').where({ id }).first();
    const orderItems = await withItems(id);
    res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('orders').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

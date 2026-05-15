const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { item_id } = req.query;
    let query = db('transactions')
      .leftJoin('items', 'transactions.item_id', 'items.id')
      .select('transactions.*', 'items.name as item_name')
      .orderBy('transactions.created_at', 'desc')
      .limit(100);
    if (item_id) query = query.where('transactions.item_id', item_id);
    res.json(await query);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { item_id, type, quantity, event_name, notes, reference_tx_id, delivery_type } = req.body;

    await db.transaction(async (trx) => {
      const item = await trx('items').where({ id: item_id }).first();
      if (!item) throw new Error('Item not found');

      const delta = type === 'check_out' ? -quantity : quantity;
      const newQty = item.quantity + delta;
      if (newQty < 0) throw new Error('Insufficient stock');

      await trx('items').where({ id: item_id }).update({ quantity: newQty, updated_at: trx.fn.now() });
      const [{ id }] = await trx('transactions').insert({
        item_id,
        type,
        quantity,
        event_name: event_name || null,
        notes: notes || null,
        reference_tx_id: reference_tx_id || null,
        delivery_type: delivery_type || null,
      }).returning('id');
      const tx = await trx('transactions').where({ id }).first();
      res.status(201).json(tx);
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

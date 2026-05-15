const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { category, search, low_stock } = req.query;
    let query = db('items')
      .leftJoin('categories', 'items.category_id', 'categories.id')
      .select(
        'items.*',
        'categories.name as category_name',
        'categories.slug as category_slug',
        'categories.icon as category_icon'
      )
      .orderBy('items.name');

    if (category) query = query.where('categories.slug', category);
    if (search) query = query.whereILike('items.name', `%${search}%`);
    if (low_stock === 'true') query = query.whereRaw('items.quantity <= items.quantity_min');

    res.json(await query);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [{ total }] = await db('items').count('id as total');
    const [{ low_stock }] = await db('items')
      .count('id as low_stock')
      .whereRaw('quantity <= quantity_min');
    const byCategory = await db('items')
      .leftJoin('categories', 'items.category_id', 'categories.id')
      .groupBy('categories.id', 'categories.name', 'categories.slug', 'categories.icon')
      .select(
        'categories.id',
        'categories.name',
        'categories.slug',
        'categories.icon',
        db.raw('COUNT(items.id) as item_count'),
        db.raw('SUM(items.quantity) as total_quantity')
      );
    res.json({ total, low_stock, byCategory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await db('items')
      .leftJoin('categories', 'items.category_id', 'categories.id')
      .select(
        'items.*',
        'categories.name as category_name',
        'categories.slug as category_slug',
        'categories.icon as category_icon'
      )
      .where('items.id', req.params.id)
      .first();
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { category_id, name, description, quantity, quantity_min, unit, condition, location, notes } = req.body;
    const [id] = await db('items').insert({
      category_id, name, description, quantity, quantity_min, unit, condition, location, notes,
    });
    const item = await db('items').where({ id }).first();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { category_id, name, description, quantity, quantity_min, unit, condition, location, notes } = req.body;
    await db('items').where({ id: req.params.id }).update({
      category_id, name, description, quantity, quantity_min, unit, condition, location, notes,
      updated_at: db.fn.now(),
    });
    const item = await db('items').where({ id: req.params.id }).first();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db('items').where({ id: req.params.id }).del();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

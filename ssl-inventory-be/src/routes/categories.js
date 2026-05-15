const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const categories = await db('categories').select('*').orderBy('name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, slug, icon } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });
    const [id] = await db('categories').insert({ name, slug, icon: icon || '📦' });
    const category = await db('categories').where({ id }).first();
    res.status(201).json(category);
  } catch (err) {
    if (err.message?.includes('UNIQUE')) return res.status(409).json({ error: 'Category name or slug already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, slug, icon } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });
    const updated = await db('categories').where({ id: req.params.id }).update({ name, slug, icon });
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    const category = await db('categories').where({ id: req.params.id }).first();
    res.json(category);
  } catch (err) {
    if (err.message?.includes('UNIQUE')) return res.status(409).json({ error: 'Category name or slug already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('categories').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

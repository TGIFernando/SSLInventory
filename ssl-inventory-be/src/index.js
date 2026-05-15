require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const categoriesRouter = require('./routes/categories');
const itemsRouter = require('./routes/items');
const transactionsRouter = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
app.use('/api/categories', categoriesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/transactions', transactionsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`SSL Inventory API running on port ${PORT}`));

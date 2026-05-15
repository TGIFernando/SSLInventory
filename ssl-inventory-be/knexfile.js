require('dotenv').config();

module.exports = {
  development: {
    client: 'sqlite3',
    connection: { filename: './ssl_inventory.db' },
    useNullAsDefault: true,
    migrations: { directory: './migrations' },
    seeds: { directory: './seeds' },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './migrations' },
    seeds: { directory: './seeds' },
  },
};

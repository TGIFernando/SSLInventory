exports.up = (knex) =>
  knex.schema.table('orders', (t) => {
    t.string('status').notNullable().defaultTo('pending'); // 'pending' | 'complete' | 'returned'
  });

exports.down = (knex) =>
  knex.schema.table('orders', (t) => {
    t.dropColumn('status');
  });

exports.up = (knex) =>
  knex.schema.table('orders', (t) => {
    t.string('delivery_type').nullable(); // 'will_call' | 'install'
  });

exports.down = (knex) =>
  knex.schema.table('orders', (t) => {
    t.dropColumn('delivery_type');
  });

exports.up = (knex) =>
  knex.schema.table('transactions', (t) => {
    t.string('delivery_type').nullable(); // 'will_call' | 'install'
  });

exports.down = (knex) =>
  knex.schema.table('transactions', (t) => {
    t.dropColumn('delivery_type');
  });

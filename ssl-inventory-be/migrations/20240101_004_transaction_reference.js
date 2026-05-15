exports.up = (knex) =>
  knex.schema.table('transactions', (t) => {
    t.integer('reference_tx_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('transactions')
      .onDelete('SET NULL');
  });

exports.down = (knex) =>
  knex.schema.table('transactions', (t) => {
    t.dropColumn('reference_tx_id');
  });

exports.up = (knex) =>
  knex.schema.createTable('transactions', (t) => {
    t.increments('id').primary();
    t.integer('item_id').unsigned().references('id').inTable('items').onDelete('CASCADE');
    t.enu('type', ['check_in', 'check_out', 'adjustment']).notNullable();
    t.integer('quantity').notNullable();
    t.string('event_name');
    t.text('notes');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable('transactions');

exports.up = async (knex) => {
  await knex.schema.createTable('orders', (t) => {
    t.increments('id');
    t.string('order_name').notNullable();
    t.string('client_name').notNullable();
    t.string('phone').nullable();
    t.string('email').nullable();
    t.text('address').nullable();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('order_items', (t) => {
    t.increments('id');
    t.integer('order_id').unsigned().notNullable()
      .references('id').inTable('orders').onDelete('CASCADE');
    t.integer('item_id').unsigned().notNullable()
      .references('id').inTable('items').onDelete('CASCADE');
    t.integer('quantity').notNullable().defaultTo(1);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
};

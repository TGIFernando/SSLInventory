exports.up = (knex) =>
  knex.schema.createTable('items', (t) => {
    t.increments('id').primary();
    t.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
    t.string('name').notNullable();
    t.text('description');
    t.integer('quantity').notNullable().defaultTo(0);
    t.integer('quantity_min').defaultTo(0);
    t.string('unit').defaultTo('pcs');
    t.string('condition').defaultTo('good'); // good | fair | poor
    t.string('location');
    t.text('notes');
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTable('items');

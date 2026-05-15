exports.up = (knex) =>
  knex.schema.createTable('categories', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable().unique();
    t.string('slug').notNullable().unique();
    t.string('icon').defaultTo('box');
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTable('categories');

exports.seed = async (knex) => {
  const staging = await knex('categories').where({ slug: 'staging' }).first();

  await knex('items').insert([
    {
      category_id: staging.id,
      name: '8x4 Stagerite',
      quantity: 100,
      quantity_min: 0,
      unit: 'pcs',
      condition: 'good',
    },
    {
      category_id: staging.id,
      name: '8x4 Soft 17',
      quantity: 100,
      quantity_min: 0,
      unit: 'pcs',
      condition: 'good',
    },
    {
      category_id: staging.id,
      name: '8x4 Wood',
      quantity: 100,
      quantity_min: 0,
      unit: 'pcs',
      condition: 'good',
    },
  ]);
};

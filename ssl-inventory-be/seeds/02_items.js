exports.seed = async (knex) => {
  const cats = await knex('categories').select('id', 'slug');
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const item = (slug, name, quantity = 100) => ({
    category_id: bySlug[slug],
    name,
    quantity,
    quantity_min: 0,
    unit: 'pcs',
    condition: 'good',
  });

  await knex('items').insert([
    // Stage Tops
    item('stage-tops', '8x4 Stagerite', 100),
    item('stage-tops', '8x4 Soft 17', 100),
    item('stage-tops', '8x4 Wood', 100),

    // Braces
    item('braces', 'Single Post Z Brace'),
    item('braces', 'H Frame 3ft 4ft'),

    // Skirting
    item('skirting', 'Boards'),
    item('skirting', 'Skirts'),

    // Lighting
    item('lighting', 'Mac Viper'),
    item('lighting', 'Freedom Par'),
    item('lighting', 'ColorSource'),
    item('lighting', 'Altman'),

    // Carpet
    item('carpet', '10x10 Red Carpet'),
    item('carpet', '10x10 Grey Carpet'),
    item('carpet', '10x10 Blue Carpet'),
    item('carpet', '10x10 Black Carpet'),

    // Electricity
    item('electricity', '25ft Edison'),
    item('electricity', '50ft Edison'),
    item('electricity', '100ft Edison'),
    item('electricity', '25ft DMX'),

    // Chairs
    item('chairs', 'Grey Folding'),
    item('chairs', 'White Folding'),
    item('chairs', 'Grey W/ Arms'),
    item('chairs', 'Tall Grey'),

    // Tables
    item('tables', '4ft Wood Table'),
    item('tables', '6ft Wood Table'),
    item('tables', '8ft Wood Table'),

    // Drape
    item('drape', '8ft Blue'),
    item('drape', '8ft Red'),
    item('drape', '8ft White'),

    // Misc
    item('misc', 'Hedge Wall'),
  ]);
};

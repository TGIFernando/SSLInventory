exports.seed = async (knex) => {
  await knex('order_items').del();
  await knex('orders').del();
  await knex('transactions').del();
  await knex('items').del();
  await knex('categories').del();

  await knex('categories').insert([
    { name: 'Stage Tops',    slug: 'stage-tops',    icon: '🎭' },
    { name: 'Braces',        slug: 'braces',        icon: '🔩' },
    { name: 'Skirting',      slug: 'skirting',      icon: '🪵' },
    { name: 'Lighting',      slug: 'lighting',      icon: '💡' },
    { name: 'Carpet',        slug: 'carpet',        icon: '🟫' },
    { name: 'Electricity',   slug: 'electricity',   icon: '⚡' },
    { name: 'Chairs',        slug: 'chairs',        icon: '🪑' },
    { name: 'Tables',        slug: 'tables',        icon: '🪵' },
    { name: 'Drape',         slug: 'drape',         icon: '🎪' },
    { name: 'Misc',          slug: 'misc',          icon: '📦' },
  ]);
};

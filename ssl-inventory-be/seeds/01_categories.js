exports.seed = async (knex) => {
  // Clear in reverse dependency order so FK constraints don't block
  await knex('order_items').del();
  await knex('orders').del();
  await knex('transactions').del();
  await knex('items').del();
  await knex('categories').del();

  await knex('categories').insert([
    { name: 'Staging',        slug: 'staging',        icon: '🎭' },
    { name: 'Lighting',       slug: 'lighting',       icon: '💡' },
    { name: 'Tables',         slug: 'tables',         icon: '🪵' },
    { name: 'Chairs',         slug: 'chairs',         icon: '🪑' },
    { name: 'Carpet',         slug: 'carpet',         icon: '🟫' },
    { name: 'Drape',          slug: 'drape',          icon: '🎪' },
    { name: 'Miscellaneous',  slug: 'miscellaneous',  icon: '📦' },
  ]);
};

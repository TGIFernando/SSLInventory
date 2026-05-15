exports.seed = async (knex) => {
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

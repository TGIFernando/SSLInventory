import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { itemApi } from '../api/client';
import { Item } from '../types';
import ItemCard from '../components/ItemCard';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    itemApi
      .getAll({ category: slug, search: search || undefined })
      .then(setItems)
      .finally(() => setLoading(false));
  }, [slug, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this item?')) return;
    await itemApi.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const label = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{label}</h1>
        <Link
          to="/items/new"
          state={{ defaultCategory: slug }}
          className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add Item
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search items…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500 text-center py-10">Loading…</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-3">📭</p>
          <p>No items found.</p>
          <Link to="/items/new" state={{ defaultCategory: slug }} className="text-brand-600 dark:text-brand-300 text-sm mt-2 inline-block hover:underline">
            Add the first one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

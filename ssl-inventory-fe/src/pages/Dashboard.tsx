import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { itemApi } from '../api/client';
import { Stats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    itemApi
      .getStats()
      .then(setStats)
      .catch(() => setError('Could not load stats — is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 py-12 text-center">Loading…</div>;
  if (error) return <div className="text-red-500 py-12 text-center">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Overview of all inventory</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
        </div>
        <div className={`bg-white dark:bg-gray-900 rounded-xl border p-5 ${stats.low_stock > 0 ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
          <p className={`text-3xl font-bold mt-1 ${stats.low_stock > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {stats.low_stock}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.byCategory.length}</p>
        </div>
      </div>

      {/* By category */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">By Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.byCategory.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 hover:shadow-sm hover:border-brand-500 dark:hover:border-brand-500 transition-all"
            >
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{cat.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {cat.item_count} item{cat.item_count !== 1 ? 's' : ''} · {cat.total_quantity ?? 0} total units
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

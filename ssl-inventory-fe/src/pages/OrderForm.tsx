import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemApi, orderApi } from '../api/client';
import { Item, Order } from '../types';

const inputCls =
  'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

interface SelectedItem {
  item_id: number;
  item_name: string;
  unit: string;
  quantity: number;
  available: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function OrderForm() {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  const [allItems, setAllItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [form, setForm] = useState({
    order_name: '',
    client_name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<Order | null>(null);

  useEffect(() => {
    itemApi.getAll().then(setAllItems).catch(() => {});
  }, []);

  const selectedIds = new Set(selected.map((s) => s.item_id));

  const searchResults = search.trim()
    ? allItems
        .filter(
          (i) =>
            !selectedIds.has(i.id) &&
            i.name.toLowerCase().includes(search.toLowerCase()),
        )
        .slice(0, 8)
    : [];

  const addItem = (item: Item) => {
    setSelected((prev) => [
      ...prev,
      { item_id: item.id, item_name: item.name, unit: item.unit, quantity: 1, available: item.quantity },
    ]);
    setSearch('');
    searchRef.current?.focus();
  };

  const removeItem = (item_id: number) =>
    setSelected((prev) => prev.filter((s) => s.item_id !== item_id));

  const updateQty = (item_id: number, qty: number) =>
    setSelected((prev) =>
      prev.map((s) => (s.item_id === item_id ? { ...s, quantity: Math.max(1, qty) } : s)),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.order_name.trim() || !form.client_name.trim()) return;
    setLoading(true);
    try {
      const order = await orderApi.create({
        ...form,
        items: selected.map((s) => ({ item_id: s.item_id, quantity: s.quantity })),
      });
      setSaved(order);
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  /* ── Confirmation screen ── */
  if (saved) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-green-300 dark:border-green-700 p-8 text-center space-y-3">
          <div className="text-4xl">✅</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order Created</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Order <span className="font-semibold text-gray-700 dark:text-gray-200">#{saved.id} — {saved.order_name}</span> for{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-200">{saved.client_name}</span> saved on{' '}
            {formatDate(saved.created_at)}.
          </p>
        </div>

        {/* Order summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Order Summary</h3>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {saved.phone && (
              <>
                <span className="text-gray-400 dark:text-gray-500">Phone</span>
                <span className="text-gray-900 dark:text-gray-100">{saved.phone}</span>
              </>
            )}
            {saved.email && (
              <>
                <span className="text-gray-400 dark:text-gray-500">Email</span>
                <span className="text-gray-900 dark:text-gray-100">{saved.email}</span>
              </>
            )}
            {saved.address && (
              <>
                <span className="text-gray-400 dark:text-gray-500">Address</span>
                <span className="text-gray-900 dark:text-gray-100">{saved.address}</span>
              </>
            )}
          </div>

          {saved.items && saved.items.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Items</p>
              {saved.items.map((oi) => (
                <div key={oi.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{oi.item_name}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {oi.quantity} {oi.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setSaved(null); setSelected([]); setForm({ order_name: '', client_name: '', phone: '', email: '', address: '' }); }}
            className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            New Order
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Make An Order</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Build an order with client info and inventory items</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client / order details */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Order Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Order Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Smith Wedding — Grand Ballroom"
                value={form.order_name}
                onChange={(e) => setForm((p) => ({ ...p, order_name: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Full name"
                value={form.client_name}
                onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
              <input
                type="tel"
                placeholder="(555) 000-0000"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <input
                type="email"
                placeholder="client@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address / Venue</label>
              <input
                type="text"
                placeholder="Venue name or street address"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Item picker */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            Items
            {selected.length > 0 && (
              <span className="ml-2 text-xs font-normal text-brand-600 dark:text-brand-400">
                {selected.length} selected
              </span>
            )}
          </h2>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search inventory items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addItem(item)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-900 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-left transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-brand-700 dark:group-hover:text-brand-300">
                      {item.name}
                    </p>
                    {item.category_name && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">{item.category_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className={`text-sm font-semibold ${item.quantity <= item.quantity_min ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.quantity} {item.unit}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      + Add
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {search.trim() && searchResults.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-3">
              No items found for "{search}"
            </p>
          )}

          {!search.trim() && selected.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
              Start typing above to search and add items
            </p>
          )}

          {/* Selected items */}
          {selected.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Selected Items
              </p>
              <div className="space-y-2">
                {selected.map((s) => (
                  <div
                    key={s.item_id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  >
                    <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {s.item_name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                      of {s.available} {s.unit}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQty(s.item_id, s.quantity - 1)}
                        className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={s.quantity}
                        onChange={(e) => updateQty(s.item_id, Number(e.target.value))}
                        className="w-12 text-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded text-sm py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => updateQty(s.item_id, s.quantity + 1)}
                        className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                      >
                        ＋
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(s.item_id)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !form.order_name.trim() || !form.client_name.trim()}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? 'Creating Order…' : `Create Order${selected.length > 0 ? ` (${selected.length} item${selected.length !== 1 ? 's' : ''})` : ''}`}
        </button>
      </form>
    </div>
  );
}

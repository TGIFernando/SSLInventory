import React, { useEffect, useState } from 'react';
import { categoryApi } from '../api/client';
import { Category } from '../types';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const ICON_SUGGESTIONS = [
  '📦','🎭','💡','🪑','🟫','🎪','🔊','🎬','🪴','🛋️',
  '🖼️','🔌','🧰','🎤','🎵','🎥','🧱','🪞','🎀','🪡',
  '🏮','🪵','🎨','⚡','🔋','📡','🎛️','🧲','🪝','🎺',
];

const inputCls =
  'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400 dark:placeholder-gray-500';

interface EditState {
  id: number;
  name: string;
  icon: string;
}

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newForm, setNewForm] = useState({ name: '', icon: '📦' });
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editing, setEditing] = useState<EditState | null>(null);
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => categoryApi.getAll().then(setCategories).catch(() => {});
  useEffect(() => { load(); }, []);

  const newSlug = slugify(newForm.name);

  /* ── Create ── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;
    setSaving(true);
    setCreateError('');
    try {
      await categoryApi.create({ name: newForm.name.trim(), slug: newSlug, icon: newForm.icon });
      setNewForm({ name: '', icon: '📦' });
      await load();
    } catch (err: any) {
      setCreateError(err.response?.data?.error ?? 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  /* ── Edit ── */
  const startEdit = (cat: Category) =>
    setEditing({ id: cat.id, name: cat.name, icon: cat.icon });

  const cancelEdit = () => { setEditing(null); setEditError(''); };

  const handleEditSave = async () => {
    if (!editing || !editing.name.trim()) return;
    setEditSaving(true);
    setEditError('');
    try {
      await categoryApi.update(editing.id, {
        name: editing.name.trim(),
        slug: slugify(editing.name),
        icon: editing.icon,
      });
      setEditing(null);
      await load();
    } catch (err: any) {
      setEditError(err.response?.data?.error ?? 'Failed to update category');
    } finally {
      setEditSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Delete "${cat.name}"? Items in this category will become uncategorized.`)) return;
    setDeleting(cat.id);
    try {
      await categoryApi.delete(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Categories</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Add, edit, or remove inventory categories</p>
      </div>

      {/* ── Create form ── */}
      <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">New Category</h2>
        {createError && <p className="text-red-600 dark:text-red-400 text-sm">{createError}</p>}

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Name</label>
            <input
              required
              placeholder="e.g. AV Equipment"
              value={newForm.name}
              onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
              className={`${inputCls} w-full`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Icon</label>
            <input
              value={newForm.icon}
              onChange={(e) => setNewForm((p) => ({ ...p, icon: e.target.value }))}
              className="w-16 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              maxLength={4}
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Quick pick:</p>
          <div className="flex flex-wrap gap-1.5">
            {ICON_SUGGESTIONS.map((ico) => (
              <button
                key={ico}
                type="button"
                onClick={() => setNewForm((p) => ({ ...p, icon: ico }))}
                className={`text-xl p-1.5 rounded-lg transition-colors ${
                  newForm.icon === ico
                    ? 'bg-brand-100 dark:bg-brand-900 ring-2 ring-brand-500'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {ico}
              </button>
            ))}
          </div>
        </div>

        {newForm.name && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Slug: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{newSlug}</code>
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !newForm.name.trim()}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          {saving ? 'Creating…' : 'Create Category'}
        </button>
      </form>

      {/* ── Category list ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            Existing Categories{' '}
            <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">({categories.length})</span>
          </h2>
        </div>

        {categories.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">No categories yet</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {categories.map((cat) =>
              editing?.id === cat.id ? (
                /* ── Inline edit row ── */
                <li key={cat.id} className="p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                  {editError && <p className="text-red-600 dark:text-red-400 text-xs">{editError}</p>}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Name</label>
                      <input
                        autoFocus
                        value={editing.name}
                        onChange={(e) => setEditing((p) => p && { ...p, name: e.target.value })}
                        className={`${inputCls} w-full`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Icon</label>
                      <input
                        value={editing.icon}
                        onChange={(e) => setEditing((p) => p && { ...p, icon: e.target.value })}
                        className="w-16 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {ICON_SUGGESTIONS.map((ico) => (
                      <button
                        key={ico}
                        type="button"
                        onClick={() => setEditing((p) => p && { ...p, icon: ico })}
                        className={`text-xl p-1.5 rounded-lg transition-colors ${
                          editing.icon === ico
                            ? 'bg-brand-100 dark:bg-brand-900 ring-2 ring-brand-500'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>

                  {editing.name && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Slug: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{slugify(editing.name)}</code>
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleEditSave}
                      disabled={editSaving || !editing.name.trim()}
                      className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold py-1.5 rounded-lg transition-colors"
                    >
                      {editSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold py-1.5 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              ) : (
                /* ── Normal row ── */
                <li key={cat.id} className="flex items-center justify-between px-5 py-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{cat.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{cat.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={deleting === cat.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors"
                    >
                      {deleting === cat.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

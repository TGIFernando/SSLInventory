import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { itemApi, categoryApi } from '../api/client';
import { Category } from '../types';

const EMPTY_FORM = {
  category_id: '',
  name: '',
  description: '',
  quantity: 0,
  quantity_min: 0,
  unit: 'pcs',
  condition: 'good',
  location: '',
  notes: '',
};

const inputCls = 'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400 dark:placeholder-gray-500';
const labelCls = 'text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1';

export default function ItemForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryApi.getAll().then(setCategories);
    if (isEdit) {
      itemApi.getOne(Number(id)).then((item) =>
        setForm({
          category_id: item.category_id?.toString() ?? '',
          name: item.name,
          description: item.description ?? '',
          quantity: item.quantity,
          quantity_min: item.quantity_min,
          unit: item.unit,
          condition: item.condition,
          location: item.location ?? '',
          notes: item.notes ?? '',
        })
      );
    } else {
      const defaultCat = (location.state as any)?.defaultCategory;
      if (defaultCat) {
        categoryApi.getAll().then((cats: Category[]) => {
          const match = cats.find((c) => c.slug === defaultCat);
          if (match) setForm((p) => ({ ...p, category_id: match.id.toString() }));
        });
      }
    }
  }, [id, isEdit, location.state]);

  const set = (field: string, val: string | number) =>
    setForm((p) => ({ ...p, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, category_id: Number(form.category_id) || null };
      if (isEdit) {
        await itemApi.update(Number(id), payload);
        navigate(`/items/${id}`);
      } else {
        const created = await itemApi.create(payload);
        navigate(`/items/${created.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-4">← Back</button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{isEdit ? 'Edit Item' : 'Add Item'}</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

        <div>
          <label className={labelCls}>Name *</label>
          <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className={inputCls}>
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Quantity</label>
            <input type="number" min={0} value={form.quantity} onChange={(e) => set('quantity', Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Min Stock</label>
            <input type="number" min={0} value={form.quantity_min} onChange={(e) => set('quantity_min', Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Unit</label>
            <input value={form.unit} onChange={(e) => set('unit', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Condition</label>
            <select value={form.condition} onChange={(e) => set('condition', e.target.value)} className={inputCls}>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Warehouse A" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} resize-none`} />
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputCls} resize-none`} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Item'}
        </button>
      </form>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { itemApi, transactionApi } from '../api/client';
import { Item, Transaction } from '../types';

const conditionColor = {
  good: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  fair: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  poor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const inputCls =
  'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function returnedCheckoutIds(transactions: Transaction[]): Set<number> {
  const ids = new Set<number>();
  for (const tx of transactions) {
    if (tx.type === 'check_in' && tx.reference_tx_id != null) {
      ids.add(tx.reference_tx_id);
    }
  }
  return ids;
}

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txForm, setTxForm] = useState({
    type: 'check_out',
    quantity: 1,
    event_name: '',
    notes: '',
    delivery_type: 'will_call' as 'will_call' | 'install',
  });
  const [selectedCheckout, setSelectedCheckout] = useState<Transaction | null>(null);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    itemApi.getOne(Number(id)).then(setItem);
    transactionApi.getAll({ item_id: Number(id) }).then(setTransactions);
  }, [id]);

  useEffect(() => {
    if (txForm.type !== 'check_in') setSelectedCheckout(null);
  }, [txForm.type]);

  const returned = returnedCheckoutIds(transactions);
  const outstandingCheckouts = transactions.filter(
    (t) => t.type === 'check_out' && !returned.has(t.id),
  );

  const selectCheckout = (tx: Transaction) => {
    if (selectedCheckout?.id === tx.id) {
      setSelectedCheckout(null);
      setTxForm((p) => ({ ...p, quantity: 1, event_name: '' }));
    } else {
      setSelectedCheckout(tx);
      setTxForm((p) => ({ ...p, quantity: tx.quantity, event_name: tx.event_name ?? '' }));
    }
  };

  const handleDelete = async () => {
    if (!item || !window.confirm('Delete this item?')) return;
    await itemApi.delete(item.id);
    navigate(-1);
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setTxLoading(true);
    try {
      await transactionApi.create({
        item_id: item.id,
        type: txForm.type,
        quantity: txForm.quantity,
        event_name: txForm.event_name,
        notes: txForm.notes,
        reference_tx_id: txForm.type === 'check_in' && selectedCheckout ? selectedCheckout.id : null,
        delivery_type: txForm.type === 'check_out' ? txForm.delivery_type : null,
      });
      const [updated, txs] = await Promise.all([
        itemApi.getOne(item.id),
        transactionApi.getAll({ item_id: item.id }),
      ]);
      setItem(updated);
      setTransactions(txs);
      setTxForm({ type: 'check_out', quantity: 1, event_name: '', notes: '', delivery_type: 'will_call' });
      setSelectedCheckout(null);
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Transaction failed');
    } finally {
      setTxLoading(false);
    }
  };

  if (!item) return <div className="text-gray-400 py-12 text-center">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-1"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.name}</h1>
          {item.category_name && <p className="text-sm text-gray-500 dark:text-gray-400">{item.category_name}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            to={`/items/${item.id}/edit`}
            className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="text-sm px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Quantity in stock</p>
            <p className={`text-3xl font-bold ${item.quantity <= item.quantity_min ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
              {item.quantity} <span className="text-base font-normal text-gray-400 dark:text-gray-500">{item.unit}</span>
            </p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${conditionColor[item.condition]}`}>
            {item.condition}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {item.location && (
            <div>
              <span className="text-gray-400 dark:text-gray-500">Location</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">{item.location}</p>
            </div>
          )}
          <div>
            <span className="text-gray-400 dark:text-gray-500">Min stock</span>
            <p className="font-medium text-gray-900 dark:text-gray-100">{item.quantity_min} {item.unit}</p>
          </div>
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800 pt-3">
            {item.description}
          </p>
        )}
        {item.notes && <p className="text-sm text-gray-500 dark:text-gray-400 italic">{item.notes}</p>}
      </div>

      {/* Transaction form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Check In / Out</h2>

        <form onSubmit={handleTransaction} className="space-y-3">
          <div className="flex gap-3">
            <select
              value={txForm.type}
              onChange={(e) => setTxForm((p) => ({ ...p, type: e.target.value }))}
              className={`${inputCls} flex-1`}
            >
              <option value="check_out">Check Out</option>
              <option value="check_in">Check In</option>
              <option value="adjustment">Adjustment</option>
            </select>
            <input
              type="number"
              min={1}
              value={txForm.quantity}
              onChange={(e) => setTxForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
              className={`${inputCls} w-24`}
            />
          </div>

          {/* Will Call / Install toggle — only on check out */}
          {txForm.type === 'check_out' && (
            <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 text-sm font-medium">
              <button
                type="button"
                onClick={() => setTxForm((p) => ({ ...p, delivery_type: 'will_call' }))}
                className={`flex-1 py-2 transition-colors ${
                  txForm.delivery_type === 'will_call'
                    ? 'bg-brand-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                🚗 Will Call
              </button>
              <button
                type="button"
                onClick={() => setTxForm((p) => ({ ...p, delivery_type: 'install' }))}
                className={`flex-1 py-2 border-l border-gray-300 dark:border-gray-600 transition-colors ${
                  txForm.delivery_type === 'install'
                    ? 'bg-brand-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                🔧 Install
              </button>
            </div>
          )}

          {/* Outstanding check-out picker */}
          {txForm.type === 'check_in' && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Return from a previous check-out
              </p>
              {outstandingCheckouts.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 py-2 text-center">
                  No outstanding check-outs
                </p>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {outstandingCheckouts.map((tx) => {
                    const isSelected = selectedCheckout?.id === tx.id;
                    return (
                      <button
                        key={tx.id}
                        type="button"
                        onClick={() => selectCheckout(tx)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left text-sm transition-colors ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-gray-900 dark:text-gray-100'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`shrink-0 ${isSelected ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'}`}>
                            {isSelected ? '✓' : '↑'}
                          </span>
                          <span className="font-medium truncate">
                            {tx.event_name || (
                              <span className="text-gray-400 dark:text-gray-500 italic font-normal">No event</span>
                            )}
                          </span>
                          {tx.delivery_type && (
                            <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                              {tx.delivery_type === 'will_call' ? '🚗 Will Call' : '🔧 Install'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className={`font-semibold ${isSelected ? 'text-brand-600 dark:text-brand-300' : ''}`}>
                            {tx.quantity} {item.unit}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(tx.created_at)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedCheckout && (
                <p className="text-xs text-brand-600 dark:text-brand-400">
                  Returning {txForm.quantity} {item.unit} — adjust quantity above if needed.
                </p>
              )}
            </div>
          )}

          <input
            type="text"
            placeholder="Event name (optional)"
            value={txForm.event_name}
            onChange={(e) => setTxForm((p) => ({ ...p, event_name: e.target.value }))}
            className={`${inputCls} w-full`}
          />

          <button
            type="submit"
            disabled={txLoading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            {txLoading
              ? 'Processing…'
              : txForm.type === 'check_in'
              ? 'Check In'
              : txForm.type === 'check_out'
              ? `Check Out — ${txForm.delivery_type === 'will_call' ? 'Will Call' : 'Install'}`
              : 'Apply Adjustment'}
          </button>
        </form>
      </div>

      {/* History */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">History</h2>
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`font-medium shrink-0 ${
                      tx.type === 'check_out'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {tx.type === 'check_out' ? '↑ Out' : tx.type === 'check_in' ? '↓ In' : '⇄ Adj'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 truncate">
                    {tx.event_name || <span className="italic text-gray-300 dark:text-gray-600">no event</span>}
                  </span>
                  {tx.type === 'check_out' && tx.delivery_type && (
                    <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {tx.delivery_type === 'will_call' ? '🚗 Will Call' : '🔧 Install'}
                    </span>
                  )}
                  {tx.type === 'check_out' && returned.has(tx.id) && (
                    <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                      returned
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {tx.quantity} {item.unit}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(tx.created_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

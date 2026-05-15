import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { orderApi } from '../api/client';
import { Order } from '../types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const deliveryBadge = (type: Order['delivery_type']) => {
  if (type === 'will_call')
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  if (type === 'install')
    return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
  return '';
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    orderApi.getOne(Number(id)).then(setOrder).catch(() => navigate('/orders'));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!order || !window.confirm(`Delete order "${order.order_name}"? This will return all items to inventory.`)) return;
    setDeleting(true);
    try {
      await orderApi.delete(order.id);
      navigate('/orders');
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Failed to delete order');
      setDeleting(false);
    }
  };

  if (!order) return <div className="text-gray-400 py-12 text-center">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/orders')}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-1"
          >
            ← Orders
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{order.order_name}</h1>
            {order.delivery_type && (
              <span className={`text-sm px-2.5 py-1 rounded-full font-medium ${deliveryBadge(order.delivery_type)}`}>
                {order.delivery_type === 'will_call' ? '🚗 Will Call' : '🔧 Install'}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Order #{order.id} · {formatDate(order.created_at)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            to={`/orders/${order.id}/edit`}
            className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Client info */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Client Info</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Client</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{order.client_name}</p>
          </div>
          {order.phone && (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Phone</p>
              <a href={`tel:${order.phone}`} className="font-medium text-brand-600 dark:text-brand-400 hover:underline">
                {order.phone}
              </a>
            </div>
          )}
          {order.email && (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Email</p>
              <a href={`mailto:${order.email}`} className="font-medium text-brand-600 dark:text-brand-400 hover:underline">
                {order.email}
              </a>
            </div>
          )}
          {order.address && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Address / Venue</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{order.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Items
          {order.items && order.items.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
              ({order.items.length})
            </span>
          )}
        </h2>

        {!order.items || order.items.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No items on this order</p>
        ) : (
          <div className="space-y-2">
            {order.items.map((oi) => (
              <div key={oi.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{oi.item_name}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {oi.quantity} <span className="font-normal text-gray-400 dark:text-gray-500">{oi.unit}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        Last updated {formatDate(order.updated_at)} · Deleting this order returns all items to inventory
      </p>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/client';
import { Order } from '../types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const STATUS_META: Record<Order['status'], { label: string; cls: string }> = {
  pending:  { label: '⏳ Pending',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  complete: { label: '✅ Complete', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  returned: { label: '↩ Returned',  cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

const DELIVERY_META: Record<string, { label: string; cls: string }> = {
  will_call: { label: '🚗 Will Call', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  install:   { label: '🔧 Install',   cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
};

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const status = STATUS_META[order.status];
  const delivery = order.delivery_type ? DELIVERY_META[order.delivery_type] : null;

  return (
    <div
      onClick={() => navigate(`/orders/${order.id}`)}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{order.order_name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${status.cls}`}>{status.label}</span>
            {delivery && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${delivery.cls}`}>{delivery.label}</span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{order.client_name}</p>
          {order.address && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">📍 {order.address}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(order.created_at)}</p>
          {(order.item_count ?? 0) > 0 && (
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
              {order.item_count} item{order.item_count !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
      {(order.phone || order.email) && (
        <div className="flex gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
          {order.phone && <span>📞 {order.phone}</span>}
          {order.email && <span>✉️ {order.email}</span>}
        </div>
      )}
    </div>
  );
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'finished'>('active');

  useEffect(() => {
    orderApi.getAll()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter((o) => o.status === 'pending' || o.status === 'complete');
  const finishedOrders = orders.filter((o) => o.status === 'returned');
  const displayed = tab === 'active' ? activeOrders : finishedOrders;

  if (loading) return <div className="text-gray-400 py-12 text-center">Loading…</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
        <Link to="/orders/new"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors">
          ＋ New Order
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'active'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Active
          {activeOrders.length > 0 && (
            <span className="ml-1.5 text-xs bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded-full">
              {activeOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('finished')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'finished'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Finished
          {finishedOrders.length > 0 && (
            <span className="ml-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
              {finishedOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Order cards */}
      {displayed.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center space-y-3">
          <p className="text-4xl">{tab === 'active' ? '📋' : '✅'}</p>
          <p className="text-gray-500 dark:text-gray-400">
            {tab === 'active' ? 'No active orders' : 'No finished orders yet'}
          </p>
          {tab === 'active' && (
            <Link to="/orders/new"
              className="inline-block mt-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors">
              Create your first order
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
};

export default function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getAll()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 py-12 text-center">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/orders/new"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          ＋ New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center space-y-3">
          <p className="text-4xl">📋</p>
          <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
          <Link to="/orders/new"
            className="inline-block mt-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors">
            Create your first order
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {order.order_name}
                    </h3>
                    {order.delivery_type && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${deliveryBadge(order.delivery_type)}`}>
                        {order.delivery_type === 'will_call' ? '🚗 Will Call' : '🔧 Install'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{order.client_name}</p>
                  {order.address && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">📍 {order.address}</p>
                  )}
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
          ))}
        </div>
      )}
    </div>
  );
}

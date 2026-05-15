import React from 'react';
import { Link } from 'react-router-dom';
import { Item } from '../types';

const conditionColor = {
  good: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  fair: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  poor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface Props {
  item: Item;
  onDelete?: (id: number) => void;
}

export default function ItemCard({ item, onDelete }: Props) {
  const isLow = item.quantity <= item.quantity_min;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/items/${item.id}`} className="font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-600 dark:hover:text-brand-300 leading-tight">
          {item.name}
        </Link>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${conditionColor[item.condition]}`}>
          {item.condition}
        </span>
      </div>

      {item.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${isLow ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {item.quantity}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{item.unit}</span>
          {isLow && <span className="ml-1 text-xs text-red-500 font-medium">⚠ Low</span>}
        </div>

        <div className="flex gap-1.5">
          <Link
            to={`/items/${item.id}/edit`}
            className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Edit
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="text-xs px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {item.location && (
        <p className="text-xs text-gray-400 dark:text-gray-500">📍 {item.location}</p>
      )}
    </div>
  );
}

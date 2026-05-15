import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { categoryApi } from '../api/client';
import { Category } from '../types';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
  }, [location.pathname]);

  const navBase = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors';
  const navActive = 'bg-brand-50 text-brand-700 dark:bg-gray-800 dark:text-brand-300';
  const navIdle = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <span className="text-2xl">🗂️</span>
          <span className="font-bold text-lg text-brand-600 dark:text-brand-300 tracking-tight">SSL Inventory</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          <NavLink
            to="/"
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}
          >
            <span className="text-base">📊</span> Dashboard
          </NavLink>

          <NavLink
            to="/orders"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}
          >
            <span className="text-base">📋</span> Orders
          </NavLink>

          <div className="pt-3 pb-1 px-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Categories</p>
          </div>

          {categories.map((cat) => (
            <NavLink
              key={cat.id}
              to={`/category/${cat.slug}`}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}
            >
              <span className="text-base">{cat.icon}</span>
              <span className="truncate">{cat.name}</span>
            </NavLink>
          ))}

          <div className="pt-3 pb-1 px-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Settings</p>
          </div>

          <NavLink
            to="/categories"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}
          >
            <span className="text-base">⚙️</span> Manage Categories
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <NavLink
            to="/items/new"
            className="flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg py-2 transition-colors"
          >
            ＋ Add Item
          </NavLink>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ☰
            </button>
            <span className="font-bold text-brand-600 dark:text-brand-300">SSL Inventory</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-lg"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

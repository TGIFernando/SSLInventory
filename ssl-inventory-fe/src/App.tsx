import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import ItemDetail from './pages/ItemDetail';
import ItemForm from './pages/ItemForm';
import ManageCategories from './pages/ManageCategories';
import OrderForm from './pages/OrderForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="orders/new" element={<OrderForm />} />
          <Route path="items/new" element={<ItemForm />} />
          <Route path="items/:id" element={<ItemDetail />} />
          <Route path="items/:id/edit" element={<ItemForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

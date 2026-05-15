import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

export default api;

export const categoryApi = {
  getAll: () => api.get('/categories').then((r) => r.data),
  create: (data: { name: string; slug: string; icon: string }) =>
    api.post('/categories', data).then((r) => r.data),
  update: (id: number, data: { name: string; slug: string; icon: string }) =>
    api.put(`/categories/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const itemApi = {
  getAll: (params?: { category?: string; search?: string; low_stock?: boolean }) =>
    api.get('/items', { params }).then((r) => r.data),
  getOne: (id: number) => api.get(`/items/${id}`).then((r) => r.data),
  getStats: () => api.get('/items/stats').then((r) => r.data),
  create: (data: object) => api.post('/items', data).then((r) => r.data),
  update: (id: number, data: object) => api.put(`/items/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/items/${id}`),
};

export const transactionApi = {
  getAll: (params?: { item_id?: number }) =>
    api.get('/transactions', { params }).then((r) => r.data),
  create: (data: object) => api.post('/transactions', data).then((r) => r.data),
};

export const orderApi = {
  getAll: () => api.get('/orders').then((r) => r.data),
  getOne: (id: number) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (data: object) => api.post('/orders', data).then((r) => r.data),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

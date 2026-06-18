import api from './api';

const productService = {
  getAll: () => api.get('/products'),
  getAllAdmin: () => api.get('/products/admin/all'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export default productService;

import api from './api';

const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/myorders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  cancelOrder: (id) => api.delete(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getAllAdmin: () => api.get('/orders/admin/all'),
};

export default orderService;

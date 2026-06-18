import api from './api';

export const promoService = {
  create: (data) => api.post('/promocodes', data),
  validate: (code) => api.post('/promocodes/validate', { code }),
  getAll: () => api.get('/promocodes'),
  getActive: () => api.get('/promocodes/active'),
  update: (id, data) => api.put(`/promocodes/${id}`, data),
  delete: (id) => api.delete(`/promocodes/${id}`),
};

export const feedbackService = {
  create: (data) => api.post('/feedback', data),
  getAll: () => api.get('/feedback'),
  getById: (id) => api.get(`/feedback/${id}`),
  delete: (id) => api.delete(`/feedback/${id}`),
};

export const analyticsService = {
  getSales: () => api.get('/analytics/sales'),
  getDateRange: (startDate, endDate) =>
    api.get(`/analytics/daterange?startDate=${startDate}&endDate=${endDate}`),
  getPopular: () => api.get('/analytics/popular'),
  getUsers: () => api.get('/analytics/users'),
  getOrderStatus: () => api.get('/analytics/orders/status'),
};

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

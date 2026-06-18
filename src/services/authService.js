import api from './api';

const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  addAddress: (data) => api.post('/auth/address', data),
  updateAddress: (addressId, data) => api.put(`/auth/address/${addressId}`, data),
  deleteAddress: (addressId) => api.delete(`/auth/address/${addressId}`),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
};

export default authService;

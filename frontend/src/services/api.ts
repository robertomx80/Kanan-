import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// Auth API
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

// Products API
export const productsApi = {
  search: (params: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getCurrentPrices: (id: string) => api.get(`/products/${id}/prices/current`),
  getPriceHistory: (id: string, days = 30) =>
    api.get(`/products/${id}/prices/history`, { params: { days } }),
};

// Tracking API
export const trackingApi = {
  getMyTracking: () => api.get('/tracking'),
  trackProduct: (productId: string) => api.post('/tracking', { productId }),
  untrackProduct: (id: string) => api.delete(`/tracking/${id}`),
  getMyAlerts: () => api.get('/tracking/alerts'),
  createAlert: (data: any) => api.post('/tracking/alerts', data),
  deleteAlert: (id: string) => api.delete(`/tracking/alerts/${id}`),
};

// Subscriptions API
export const subscriptionsApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrent: () => api.get('/subscriptions/current'),
  upgrade: () => api.post('/subscriptions/upgrade'),
  cancel: () => api.delete('/subscriptions/cancel'),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/me'),
  getStats: () => api.get('/users/me/stats'),
  updateProfile: (data: any) => api.put('/users/me', data),
  changePassword: (data: any) => api.post('/users/me/change-password', data),
};

// Admin API
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Stores
  getStores: () => api.get('/admin/stores'),
  getStore: (id: string) => api.get(`/admin/stores/${id}`),
  createStore: (data: any) => api.post('/admin/stores', data),
  updateStore: (id: string, data: any) => api.put(`/admin/stores/${id}`, data),
  deleteStore: (id: string) => api.delete(`/admin/stores/${id}`),

  // System Config
  getConfigs: () => api.get('/admin/config'),
  getConfig: (key: string) => api.get(`/admin/config/${key}`),
  createConfig: (data: any) => api.post('/admin/config', data),
  updateConfig: (key: string, data: any) => api.put(`/admin/config/${key}`, data),
  deleteConfig: (key: string) => api.delete(`/admin/config/${key}`),

  // Jobs
  getJobs: (limit?: number) => api.get('/admin/jobs', { params: { limit } }),
  getJobStats: () => api.get('/admin/jobs/stats'),

  // Users
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (id: string, role: 'USER' | 'ADMIN') =>
    api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

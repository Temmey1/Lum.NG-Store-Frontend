import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumng_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lumng_admin_token');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// ===== API METHODS =====
export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: (id, file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post(`/products/${id}/image`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const ordersApi = {
  getAll: (params) => api.get('/orders', { params }),
  getOne: (ref) => api.get(`/orders/${ref}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (ref, status) => api.patch(`/orders/${ref}/status`, { status }),
  clearAll: () => api.delete('/orders'),
};

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  updateCredentials: (data) => api.put('/auth/credentials', data),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const aiApi = {
  status: ()                             => api.get('/ai/status'),
  chat:   (history, message)            => api.post('/ai/chat', { history, message }),
};

export const cartRecoveryApi = {
  sync:        (payload)                => api.post('/cart-recovery/sync', payload),
  attachEmail: (sessionId, email, name) => api.post('/cart-recovery/attach-email', { sessionId, email, name }),
  markRecovered: (sessionId)            => api.post('/cart-recovery/recovered', { sessionId }),
  restore:     (token)                  => api.get(`/cart-recovery/restore/${token}`),
};

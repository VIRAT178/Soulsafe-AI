import axios from 'axios';

const api = axios.create({
  baseURL: (typeof import.meta !== 'undefined' ? import.meta.env.VITE_API_URL : undefined) 
    || process.env.REACT_APP_API_URL 
    || 'http://localhost:5000/api',
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Send credentials (cookies) with requests by default; backend already allows credentials.
api.defaults.withCredentials = true;

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors for authentication endpoints
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const isOnAuthPage = window.location.pathname.includes('/login') || 
                          window.location.pathname.includes('/register') ||
                          window.location.pathname === '/';
      
      // Only redirect if it's an auth endpoint failure and not already on auth pages
      if (isAuthEndpoint && !isOnAuthPage) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (formData) =>
    api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const capsuleAPI = {
  create: (data, config = {}) => api.post('/capsules', data, config),
  getAll: () => api.get('/capsules'),
  getById: (id) => api.get(`/capsules/${id}`),
  update: (id, data) => api.put(`/capsules/${id}`, data),
  updateMedia: (id, data) => api.put(`/capsules/${id}/media`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/capsules/${id}`),
  analyze: (id) => api.post(`/capsules/${id}/analyze`),
  analyzeAll: () => api.post('/capsules/batch/analyze-all'),
  checkUnlocks: () => api.get('/capsules/check-unlocks'),
};

export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  analyze: (content) => api.post('/ai/analyze', { content }),
  getEmotions: (text) => api.post('/ai/emotions', { text }),
};

export const milestoneAPI = {
  check: () => api.get('/milestones/check'),
  getHistory: (params) => api.get('/milestones/history', { params }),
  addManual: (data) => api.post('/milestones/manual', data),
  connectSocial: (platform, data) => api.post('/milestones/connect-social', { platform, ...data }),
  connectCalendar: (provider, data) => api.post('/milestones/connect-calendar', { provider, ...data }),
  disconnect: (platform) => api.delete(`/milestones/disconnect/${platform}`),
};

export const analyticsAPI = {
  getInsights: (timeRange = '30d') => api.get(`/analytics/insights?timeRange=${timeRange}`),
  getEmotionTrends: (period = 'week') => api.get(`/analytics/emotions/trends?period=${period}`),
};

export default api;
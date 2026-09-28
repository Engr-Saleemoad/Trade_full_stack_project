import axios from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

const API = axios.create({
  baseURL: rawBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header interceptor and sanitize /api path prefix
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('http')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return req;
});

// Response interceptor for automatic session revocation on Suspended / Blocked status
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const errMsg = error.response.data?.error || error.response.data?.message || '';
      if (
        errMsg.includes('suspended') ||
        errMsg.includes('blocked') ||
        errMsg.includes('Access denied')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;

import axios from 'axios';

const getBaseApiUrl = () => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '5173' || port === '3000') {
      return `${protocol}//${hostname}:5000`;
    }
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.startsWith('http') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/api\/?$/, '');
  }

  return 'https://trade-full-stack-project-backend.onrender.com';
};

const API = axios.create({
  baseURL: getBaseApiUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
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
        (errMsg.includes('suspended') ||
        errMsg.includes('blocked') ||
        errMsg.includes('Access denied')) &&
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/admin')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;

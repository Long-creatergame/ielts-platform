import axios from 'axios';

function resolveBaseUrl() {
  const explicit = String(import.meta.env.VITE_API_BASE_URL || '').trim();
  const isDev = !!import.meta.env.DEV;

  // In dev, prefer localhost even if VITE_API_BASE_URL is accidentally set to production.
  // Allow explicit override ONLY when it points to localhost/127.0.0.1.
  if (isDev) {
    if (explicit && /(localhost|127\.0\.0\.1)/i.test(explicit)) return explicit;
    return 'http://127.0.0.1:4000/api';
  }

  if (explicit) return explicit;

  // In production, we expect VITE_API_BASE_URL to be set (Vercel env).
  // Fallback to same-origin /api only if you run a reverse proxy in front.
  return '/api';
}

const baseURL = resolveBaseUrl();

const api = axios.create({
  baseURL,
  // Bearer-only auth (no cookies)
  timeout: 30000, // 30 seconds for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Attach auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Request timeout:', error.config?.url);
      error.isTimeout = true;
    }
    
    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect if already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    // Centralize error logging/handling
    return Promise.reject(error);
  }
);

export default api;



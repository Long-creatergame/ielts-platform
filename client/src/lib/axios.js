import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://ielts-platform-emrv.onrender.com/api';

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



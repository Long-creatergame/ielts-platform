import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://ielts-platform-emrv.onrender.com/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Attach auth token here if available (placeholder)
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralize error logging/handling
    return Promise.reject(error);
  }
);

export default api;



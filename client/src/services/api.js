import axios from "axios";
import { getUserTimezone } from "../utils/timezone";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CORS with credentials
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Attach timezone header to all requests
    const timezone = getUserTimezone();
    config.headers["X-Timezone"] = timezone;
    
    // Attach language header from i18n (if available)
    const language = localStorage.getItem("i18nextLng") || 
                     navigator.language.split("-")[0] || 
                     "en";
    config.headers["X-Language"] = language;
    config.headers["Accept-Language"] = language;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (Unauthorized) - no token
    if (error.response?.status === 401) {
      console.warn("⚠️ No token or unauthorized. Redirecting to login.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    // Handle 403 (Forbidden) - invalid/expired token
    else if (error.response?.status === 403) {
      console.warn("⚠️ Token expired or invalid. Logging out.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

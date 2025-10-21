const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const dashboardAPI = {
  getDashboardData: async (token) => {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  }
};

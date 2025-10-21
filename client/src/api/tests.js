const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const testsAPI = {
  startTest: async (level, token) => {
    const response = await fetch(`${API_BASE_URL}/tests/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ level })
    });
    return response.json();
  },

  submitTest: async (testData, token) => {
    const response = await fetch(`${API_BASE_URL}/tests/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });
    return response.json();
  },

  getTestHistory: async (token) => {
    const response = await fetch(`${API_BASE_URL}/tests/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  }
};

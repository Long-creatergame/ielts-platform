const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const paymentsAPI = {
  createPayment: async (testId, token) => {
    const response = await fetch(`${API_BASE_URL}/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ testId })
    });
    return response.json();
  },

  unlockTest: async (testId, token) => {
    const response = await fetch(`${API_BASE_URL}/payments/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ testId })
    });
    return response.json();
  }
};

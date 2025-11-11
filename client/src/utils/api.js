import api from '@/lib/axios';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function loginUser(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
}

export async function getTests() {
  const { data } = await api.get('/api/tests');
  return data;
}

export async function getExamResults(userId) {
  const { data } = await api.get(`/api/exam/result/${userId}`);
  return data;
}



import api from '@/lib/axios';

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://ielts-platform-emrv.onrender.com/api';

export async function loginUser(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function getTests() {
  const { data } = await api.get('/tests');
  return data;
}

export async function getExamResults(userId) {
  const { data } = await api.get(`/exam/result/${userId}`);
  return data;
}



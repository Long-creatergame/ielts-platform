// Unified API base URL detection with safe fallbacks
export const API_BASE =
  (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_BASE_URL) ||
  'https://ielts-platform-emrv.onrender.com/api';

export async function safeFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.warn('⚠️ API Warning:', res.status, url);
      return { error: res.status, message: `API returned ${res.status}` };
    }
    try {
      return await res.json();
    } catch (_) {
      return { ok: true };
    }
  } catch (err) {
    console.error('❌ Network error:', err?.message || err);
    return { error: 'offline', message: 'Backend temporarily unavailable' };
  }
}

export async function loginUser(email, password) {
  return safeFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

export async function getTests() {
  return safeFetch('/tests');
}

export async function getExamResults(userId) {
  return safeFetch(`/exam/result/${userId}`);
}



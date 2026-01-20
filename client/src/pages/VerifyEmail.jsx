import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../lib/axios';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function VerifyEmail() {
  const query = useQuery();
  const token = query.get('token') || '';

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }
      try {
        setStatus('loading');
        const { data } = await api.get('/auth/verify-email', { params: { token } });
        if (cancelled) return;
        setStatus('success');
        setMessage(data?.message || 'Email verified successfully.');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err.response?.data?.message || 'Unable to verify email.');
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="app-container min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md p-8 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Verify email</h1>
        {status === 'loading' && <p className="text-gray-600">Verifying…</p>}
        {status !== 'loading' && (
          <p className={status === 'success' ? 'text-green-700' : 'text-red-600'}>{message}</p>
        )}
        <div className="pt-2 flex gap-3">
          <Link to="/login" className="btn-primary px-4 py-2">
            Go to login
          </Link>
          <Link to="/" className="btn-secondary px-4 py-2">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}


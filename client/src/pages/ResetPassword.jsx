import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../lib/axios';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const query = useQuery();
  const token = query.get('token') || '';
  const email = query.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('idle');
    setMessage('');

    if (!token || !email) {
      setStatus('error');
      setMessage('Missing token or email.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/auth/reset-password/confirm', { email, token, newPassword });
      setStatus('success');
      setMessage(data?.message || 'Password reset successfully.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
          <p className="text-gray-600">Choose a new password for your account.</p>
        </div>

        {status !== 'idle' && (
          <p className={status === 'success' ? 'text-green-700' : 'text-red-600'}>{message}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Back to{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}


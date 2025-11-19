import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    targetBand: 6.5,
    currentLevel: 'B1',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-600">Start tracking your IELTS Writing Task 2 progress.</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              type="text"
              name="name"
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Target band</label>
              <input
                type="number"
                step="0.5"
                min="4"
                max="9"
                name="targetBand"
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                value={form.targetBand}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current level</label>
              <select
                name="currentLevel"
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                value={form.currentLevel}
                onChange={handleChange}
              >
                {['A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}


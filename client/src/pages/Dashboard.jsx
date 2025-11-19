import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/dashboard');
        setDashboard(data.data || data);
      } catch (err) {
        console.error('Dashboard load failed', err);
        setError(err.response?.data?.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen">
        <div className="card p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <Link to="/writing" className="btn-primary inline-block px-4 py-2">
            Go to Writing Task
          </Link>
        </div>
      </div>
    );
  }

  const { user, writing } = dashboard || {};
  const submissions = writing?.recentSubmissions || [];

  return (
    <div className="app-container min-h-screen">
      <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'writer'} 👋
          </h1>
          <p className="text-gray-600">
            Target band: <strong>{user?.targetBand || 6.5}</strong> • Current level:{' '}
            <strong>{user?.currentLevel || 'B1'}</strong>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/writing" className="btn-primary px-4 py-2">
              Start a new Writing Task
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="card p-5">
            <p className="text-sm text-gray-500 mb-1">Submissions</p>
            <p className="text-3xl font-bold text-gray-900">
              {writing?.totalSubmissions || 0}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-gray-500 mb-1">Average band</p>
            <p className="text-3xl font-bold text-gray-900">
              {writing?.averageBand ? writing.averageBand : '—'}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-gray-500 mb-1">Last result</p>
            <p className="text-3xl font-bold text-gray-900">
              {writing?.latestSubmission?.aiScore?.overall || '—'}
            </p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent submissions</h2>
            <Link to="/writing" className="text-blue-600 hover:underline text-sm">
              Submit another essay →
            </Link>
          </div>
          {submissions.length === 0 ? (
            <p className="text-gray-600">No essays yet. Start with your first Task 2 response!</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition"
                >
                  <p className="text-sm text-gray-500">
                    {new Date(submission.createdAt).toLocaleString()}
                  </p>
                  <p className="font-semibold text-gray-800 mt-1">
                    {submission.aiScore?.overall
                      ? `Overall band ${submission.aiScore.overall}`
                      : 'Awaiting AI feedback'}
                  </p>
                  <p className="text-gray-600 mt-2">{submission.prompt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


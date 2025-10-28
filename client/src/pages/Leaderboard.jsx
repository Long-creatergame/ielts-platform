import React, { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    fetch(`${API_BASE_URL}/api/leaderboard/top`)
      .then(r => r.json())
      .then(d => setEntries(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">🏆 Bảng xếp hạng</h1>
        <div className="bg-white rounded-xl shadow divide-y">
          {entries.map((e, idx) => (
            <div key={e._id || idx} className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 text-gray-600">#{idx + 1}</div>
                <div className="font-medium text-gray-900">{e.userName || 'User'}</div>
              </div>
              <div className="text-blue-600 font-bold">{e.points} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



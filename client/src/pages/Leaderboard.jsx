import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    const token = localStorage.getItem('token');
    
    // Fetch leaderboard
    fetch(`${API_BASE_URL}/api/leaderboard/top`)
      .then(r => r.json())
      .then(d => setEntries(d.data || []));
    
    // Fetch my rank
    if (user) {
      fetch(`${API_BASE_URL}/api/leaderboard/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => setMyRank(d.data))
        .catch(() => {});
    }
    
    setLoading(false);
  }, [user]);

  if (loading) return <div className="p-6">Đang tải...</div>;

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏆';
  };

  const getNextMilestone = (points) => {
    const milestones = [100, 250, 500, 1000, 2000, 5000];
    const next = milestones.find(m => m > points);
    return next ? next - points : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">🏆 Bảng xếp hạng</h1>
        
        {/* My Rank Card */}
        {myRank && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 mb-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Vị trí của bạn</h2>
              <div className="text-4xl font-bold mb-2">
                {getRankIcon(myRank.rank)} #{myRank.rank}
              </div>
              <div className="text-lg mb-4">{myRank.me?.points || 0} điểm</div>
              
              {getNextMilestone(myRank.me?.points || 0) > 0 && (
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-sm">
                    +{getNextMilestone(myRank.me?.points || 0)} điểm nữa để đạt mốc tiếp theo! 🚀
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Top 50 người dùng</h2>
          </div>
          
          <div className="divide-y">
            {entries.map((e, idx) => (
              <div key={e._id || idx} className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                e.userId === user?.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getRankIcon(idx + 1)}</span>
                    <div className="w-8 text-gray-600 font-bold">#{idx + 1}</div>
                  </div>
                  <div className="font-medium text-gray-900">
                    {e.userName || 'User'}
                    {e.userId === user?.id && <span className="ml-2 text-blue-600 text-sm">(Bạn)</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-600 font-bold text-lg">{e.points} pts</div>
                  {e.badges && e.badges.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {e.badges.slice(0, 3).map((badge, i) => (
                        <span key={i} className="mr-1">🏅</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivation CTA */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-green-900 mb-2">🎯 Tăng điểm ngay!</h3>
            <p className="text-green-800 text-sm mb-4">
              Hoàn thành bài test để nhận điểm và leo lên bảng xếp hạng
            </p>
            <button
              onClick={() => window.location.href = '/test/start'}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200"
            >
              Làm bài test ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



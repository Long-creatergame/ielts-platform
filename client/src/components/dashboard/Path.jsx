import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader';

const UnifiedProgressTracking = lazy(() => import('../UnifiedProgressTracking'));
const LearningPath = lazy(() => import('../../pages/LearningPath'));
const BandProgressChart = lazy(() => import('../BandProgressChart'));

export default function Path() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPathData();
  }, [user]);

  const loadPathData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      if (!token || !user) return;

      // Fetch learning path data
      const response = await fetch(`${API_BASE_URL}/api/learningpath/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPathData(data.data || data);
      }
    } catch (error) {
      console.error('Error loading path data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Lộ trình học</h1>
        <p className="text-white/90">Theo dõi tiến độ và mục tiêu CEFR của bạn</p>
      </div>

      {/* Learning Path */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Lộ trình học tập</h2>
        <Suspense fallback={<Loader />}>
          <LearningPath />
        </Suspense>
      </div>

      {/* Progress Tracking & Band Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Tiến độ</h2>
          <Suspense fallback={<Loader />}>
            <UnifiedProgressTracking />
          </Suspense>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Band Progress</h2>
          <Suspense fallback={<Loader />}>
            <BandProgressChart />
          </Suspense>
        </div>
      </div>

      {/* CEFR Level Info */}
      {pathData && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-bold mb-3 text-green-900">📊 Thông tin CEFR</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Current Level</p>
              <p className="text-2xl font-bold text-green-700">{user.currentLevel || 'A2'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Target Band</p>
              <p className="text-2xl font-bold text-green-700">{user.targetBand || 6.5}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Activity</p>
              <p className="text-lg font-semibold text-green-700">
                {pathData.targetSkill || 'Reading'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../Loader';

const MyWeakness = lazy(() => import('../MyWeakness'));
const DashboardAI = lazy(() => import('./DashboardAI'));
const AISupervisorPanel = lazy(() => import('./AISupervisorPanel'));

export default function Insights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [user]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      if (!token || !user) return;

      // Try to fetch insights from multiple endpoints
      const [weakSkillsRes, aiInsightsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/weakskills/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => null),
        fetch(`${API_BASE_URL}/api/ai-master/insights`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => null)
      ]);

      const weakSkills = weakSkillsRes?.ok ? await weakSkillsRes.json() : null;
      const aiInsights = aiInsightsRes?.ok ? await aiInsightsRes.json() : null;

      setInsights({
        weakSkills: weakSkills?.data || weakSkills?.weakSkills || [],
        aiInsights: aiInsights?.data || aiInsights
      });
    } catch (error) {
      console.error('Error loading insights:', error);
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Phân tích & Gợi ý</h1>
        <p className="text-white/90">AI phân tích điểm yếu và đề xuất cách cải thiện hiệu quả</p>
      </div>

      {/* My Weakness */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Điểm yếu của bạn</h2>
        <Suspense fallback={<Loader />}>
          <MyWeakness />
        </Suspense>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">AI Analytics</h2>
          <Suspense fallback={<Loader />}>
            <DashboardAI />
          </Suspense>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">AI Supervisor</h2>
          <Suspense fallback={<Loader />}>
            <AISupervisorPanel />
          </Suspense>
        </div>
      </div>

      {/* AI Recommendations */}
      {insights?.aiInsights && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold mb-3 text-blue-900">💡 Gợi ý học tập từ AI</h3>
          <div className="space-y-2 text-gray-700">
            {Array.isArray(insights.aiInsights.recommendations) ? (
              insights.aiInsights.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p>{rec}</p>
                </div>
              ))
            ) : (
              <p>{JSON.stringify(insights.aiInsights)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import ScoreCard from '../ScoreCard';
import LevelBadge from '../LevelBadge';
import GoalProgressBar from '../GoalProgressBar';
import CoachMessage from '../CoachMessage';
import ModernStatsCard from '../ModernStatsCard';
import RecentActivityAndTests from '../RecentActivityAndTests';
import DailyChallenge from '../DailyChallenge';
import Loader from '../Loader';

export default function Overview() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      if (!token || !user) return;

      const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setDashboardData(result.data || result);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const { statistics, personalization } = dashboardData || {};
  const greeting = personalization?.greeting || `${t('dashboard.greeting')} ${user.name}!`;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#35b86d] to-[#a1e3b3] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{greeting}</h1>
            <div className="flex items-center space-x-3">
              <LevelBadge level={user.currentLevel} size="sm" />
              <span className="text-white/90">
                {t('dashboard.target')}: Band {user.targetBand} | {t('dashboard.current')}: {statistics?.averageBand > 0 ? `Band ${statistics.averageBand.toFixed(1)}` : t('dashboard.noTestsYet')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatsCard
          title="Tests Completed"
          value={statistics?.totalTests || 0}
          icon="📝"
          trend={statistics?.completedTests || 0}
        />
        <ModernStatsCard
          title="Average Band"
          value={statistics?.averageBand?.toFixed(1) || '0.0'}
          icon="🎯"
          trend={statistics?.averageBand > 0 ? '↑' : '—'}
        />
        <ModernStatsCard
          title="Streak Days"
          value={statistics?.streakDays || 0}
          icon="🔥"
          trend={statistics?.streakDays > 0 ? '↑' : '—'}
        />
        <ModernStatsCard
          title="Current Level"
          value={user.currentLevel || 'A2'}
          icon="📊"
          trend="—"
        />
      </div>

      {/* Goal Progress */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">{t('dashboard.target')}</h2>
        <GoalProgressBar
          current={statistics?.averageBand || 0}
          target={user.targetBand || 6.5}
        />
      </div>

      {/* AI Coach Message */}
      {personalization?.coachMessage && (
        <CoachMessage
          message={personalization.coachMessage.message || personalization.coachMessage}
          type={personalization.coachMessage.type || 'info'}
        />
      )}

      {/* Recent Activity & Daily Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityAndTests />
        <DailyChallenge />
      </div>
    </div>
  );
}


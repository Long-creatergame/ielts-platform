import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const UnifiedProgressTracking = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // overview, charts, analytics

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/progress-tracking/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgressData(data.data);
      } else {
        // Generate mock data for demonstration
        setProgressData(generateMockProgressData());
      }
    } catch (error) {
      console.error('Fetch progress data error:', error);
      setProgressData(generateMockProgressData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockProgressData = () => {
    const days = 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        reading: 5.0 + Math.random() * 2,
        writing: 4.5 + Math.random() * 2.5,
        listening: 5.5 + Math.random() * 1.5,
        speaking: 4.0 + Math.random() * 3,
        overall: 4.5 + Math.random() * 2.5
      });
    }
    
    return {
      dailyProgress: data,
      skillBreakdown: {
        reading: { current: 6.2, target: 7.0, improvement: 0.8, trend: 'up' },
        writing: { current: 5.8, target: 6.5, improvement: 0.7, trend: 'up' },
        listening: { current: 6.5, target: 7.0, improvement: 0.5, trend: 'stable' },
        speaking: { current: 5.5, target: 6.0, improvement: 0.5, trend: 'up' }
      },
      weeklyStats: {
        testsCompleted: 12,
        studyTime: 480,
        streak: 7,
        accuracy: 78,
        improvement: 15
      },
      achievements: [
        { id: 1, title: 'First Test', description: 'Completed your first IELTS test', icon: '🎯', earned: true },
        { id: 2, title: 'Week Streak', description: '7 days of consistent practice', icon: '🔥', earned: true },
        { id: 3, title: 'Reading Master', description: 'Achieved 7.0 in Reading', icon: '📖', earned: false }
      ]
    };
  };

  const OverviewCards = ({ data }) => {
    if (!data) return null;

    const cards = [
      {
        title: t('progress.testsCompleted', 'Tests Completed'),
        value: data.weeklyStats.testsCompleted,
        icon: '📊',
        color: 'blue',
        change: `+${data.weeklyStats.improvement}%`
      },
      {
        title: t('progress.studyTime', 'Study Time'),
        value: `${Math.floor(data.weeklyStats.studyTime / 60)}h ${data.weeklyStats.studyTime % 60}m`,
        icon: '⏰',
        color: 'green',
        change: 'This week'
      },
      {
        title: t('progress.currentStreak', 'Current Streak'),
        value: `${data.weeklyStats.streak} days`,
        icon: '🔥',
        color: 'orange',
        change: 'Keep going!'
      },
      {
        title: t('progress.accuracy', 'Accuracy'),
        value: `${data.weeklyStats.accuracy}%`,
        icon: '🎯',
        color: 'purple',
        change: `+${data.weeklyStats.improvement}%`
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-green-600 mt-1">{card.change}</p>
              </div>
              <div className="text-3xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const SkillBreakdown = ({ data }) => {
    if (!data) return null;

    const skills = Object.entries(data.skillBreakdown);

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('progress.skillBreakdown', 'Skill Breakdown')}
        </h3>
        <div className="space-y-4">
          {skills.map(([skill, data]) => {
            const progress = (data.current / data.target) * 100;
            const trendIcon = data.trend === 'up' ? '📈' : data.trend === 'down' ? '📉' : '➡️';
            
            return (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">{skill}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{data.current.toFixed(1)} / {data.target}</span>
                    <span className="text-sm">{trendIcon}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      progress >= 90 ? 'bg-green-500' :
                      progress >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>+{data.improvement.toFixed(1)} {t('progress.improvement', 'improvement')}</span>
                  <span>{progress.toFixed(0)}% {t('progress.ofTarget', 'of target')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ProgressChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => Math.max(d.reading, d.writing, d.listening, d.speaking, d.overall)));
    const minValue = Math.min(...data.map(d => Math.min(d.reading, d.writing, d.listening, d.speaking, d.overall)));
    const range = maxValue - minValue;
    const padding = range * 0.1;

    const getY = (value) => {
      return 100 - ((value - minValue + padding) / (range + padding * 2)) * 100;
    };

    const getX = (index) => {
      return (index / (data.length - 1)) * 100;
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('progress.dailyProgress', 'Daily Progress')}
        </h3>
        <div className="h-64 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="0.5"
              />
            ))}
            
            {/* Reading line */}
            <polyline
              points={data.map((d, i) => `${getX(i)},${getY(d.reading)}`).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.5"
            />
            
            {/* Writing line */}
            <polyline
              points={data.map((d, i) => `${getX(i)},${getY(d.writing)}`).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="0.5"
            />
            
            {/* Listening line */}
            <polyline
              points={data.map((d, i) => `${getX(i)},${getY(d.listening)}`).join(' ')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="0.5"
            />
            
            {/* Speaking line */}
            <polyline
              points={data.map((d, i) => `${getX(i)},${getY(d.speaking)}`).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="0.5"
            />
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span>Reading</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span>Writing</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-yellow-500"></div>
              <span>Listening</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span>Speaking</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Achievements = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('progress.achievements', 'Achievements')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 ${
                achievement.earned
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <h4 className={`font-medium ${
                    achievement.earned ? 'text-green-900' : 'text-gray-700'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm ${
                    achievement.earned ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('common.loading')}</span>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="text-center p-8 text-gray-500">
        {t('progress.noData', 'No progress data available')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📊 {t('progress.title', 'Progress Tracking')}</h2>
        <p className="text-blue-100">{t('progress.subtitle', 'Track your IELTS journey and see your improvement')}</p>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-2">
        {[
          { id: 'overview', label: t('progress.overview', 'Overview') },
          { id: 'charts', label: t('progress.charts', 'Charts') },
          { id: 'analytics', label: t('progress.analytics', 'Analytics') }
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === view.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <OverviewCards data={progressData.weeklyStats} />
          <SkillBreakdown data={progressData.skillBreakdown} />
          <Achievements data={progressData.achievements} />
        </div>
      )}

      {activeView === 'charts' && (
        <ProgressChart data={progressData.dailyProgress} />
      )}

      {activeView === 'analytics' && (
        <div className="space-y-6">
          <SkillBreakdown data={progressData.skillBreakdown} />
          <ProgressChart data={progressData.dailyProgress} />
        </div>
      )}
    </div>
  );
};

export default UnifiedProgressTracking;

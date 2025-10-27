import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const ProgressDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [timeRange, setTimeRange] = useState('30'); // days

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchProgressData();
  }, [selectedSkill, timeRange]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/progress-tracking/stats?skill=${selectedSkill}&timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillIcon = (skill) => {
    switch (skill) {
      case 'reading': return '📖';
      case 'writing': return '✍️';
      case 'listening': return '👂';
      case 'speaking': return '🗣️';
      default: return '📚';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading progress data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          📊 {t('progress.title')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('progress.subtitle')}
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('progress.skill')}</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Skills</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="listening">Listening</option>
              <option value="speaking">Speaking</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('progress.timeRange')}</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">{t('progress.last30Days')}</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {progressData ? (
        <div className="space-y-8">
          {/* Overall Progress Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {progressData.totalRecommendations || 0}
                </div>
                <div className="text-sm text-gray-600">Total Recommendations</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {progressData.completedRecommendations || 0}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round(progressData.averageProgress || 0)}%
                </div>
                <div className="text-sm text-gray-600">Average Progress</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(progressData.totalTimeSpent || 0)}
                </div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
            </div>
          </div>

          {/* Skill-wise Progress */}
          {progressData.skillStats && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Skill-wise Progress</h3>
              <div className="space-y-4">
                {progressData.skillStats.map((skill, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {getSkillIcon(skill._id)} {skill._id.charAt(0).toUpperCase() + skill._id.slice(1)}
                      </h4>
                      <span className={`text-lg font-bold ${getProgressColor(skill.averageProgress)}`}>
                        {Math.round(skill.averageProgress)}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-gray-700">Recommendations</div>
                        <div className="text-gray-600">{skill.totalRecommendations}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">Completed</div>
                        <div className="text-gray-600">{skill.completedRecommendations}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">Time Spent</div>
                        <div className="text-gray-600">{formatTime(skill.totalTimeSpent)}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">Improvement</div>
                        <div className="text-gray-600">+{skill.averageImprovement?.toFixed(1) || 0} bands</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${skill.averageProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {progressData.recentActivity && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {progressData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getSkillIcon(activity.skill)}</span>
                      <div>
                        <div className="font-semibold text-gray-800">{activity.title}</div>
                        <div className="text-sm text-gray-600">{activity.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {activity.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Effectiveness */}
          {progressData.effectiveness && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommendation Effectiveness</h3>
              <div className="space-y-3">
                {progressData.effectiveness.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {getSkillIcon(item._id.skill)} {item._id.skill} - {item._id.difficulty}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.totalUsers} users • {Math.round(item.completionRate * 100)}% completion rate
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        +{item.averageImprovement?.toFixed(1) || 0}
                      </div>
                      <div className="text-sm text-gray-600">avg improvement</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {t('progress.noData')}
          </h3>
          <p className="text-gray-500 mb-4">
            {t('progress.noDataDesc')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;

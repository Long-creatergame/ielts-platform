import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatLocalTime, formatRelativeTime } from '../utils/dateFormat';
import { getUserTimezone } from '../utils/timezone';

const RecentActivityAndTests = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [user?.id]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Try to load tests from MongoDB first
      let savedTests = [];
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const token = localStorage.getItem('token');
        
        // Only fetch from MongoDB if we have a token and user
        if (token && user) {
          console.log('🔄 Fetching tests from MongoDB for user:', user.id);
          const timezone = getUserTimezone();
          const response = await fetch(`${API_BASE_URL}/api/tests/mine`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'X-Timezone': timezone
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            // Handle both {success, data} and direct data formats
            const tests = data.data || data.tests || [];
            // Transform MongoDB test format to match expected format
            savedTests = tests.map(test => ({
              id: test._id || test.id,
              testType: 'IELTS Academic',
              level: test.level || 'A2',
              date: test.dateTaken || test.createdAt || new Date().toISOString(),
              overallScore: test.totalBand || test.overallBand || 0,
              overallBand: test.totalBand || test.overallBand || 0,
              skillScores: test.skillBands || {},
              status: test.completed ? 'completed' : 'in-progress',
              testData: test
            }));
            console.log('✅ Loaded tests from MongoDB:', savedTests.length);
          } else {
            console.log('⚠️ MongoDB response not ok:', response.status);
          }
        } else {
          console.log('⚠️ No token or user, skipping MongoDB fetch');
        }
      } catch (error) {
        console.log('⚠️ MongoDB load failed, using localStorage:', error.message);
      }
      
      // Fallback to localStorage if MongoDB fails or empty
      if (savedTests.length === 0) {
        const localStorageTests = JSON.parse(localStorage.getItem('testHistory') || '[]');
        const sessionStorageTests = JSON.parse(sessionStorage.getItem('testHistory') || '[]');
        savedTests = localStorageTests.length > 0 ? localStorageTests : sessionStorageTests;
        console.log('📦 Using localStorage tests:', savedTests.length);
      }
      
      // Load milestones from localStorage
      const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
      
      // Load daily challenges
      const dailyChallenges = JSON.parse(localStorage.getItem('dailyChallenges') || '[]');
      
      // Combine all activities
      const allActivities = [];
      
      // Add test activities
      savedTests.slice(0, 3).forEach(test => {
        allActivities.push({
          type: 'test',
          id: test.id || Date.now() + Math.random(),
          title: test.testType || 'IELTS Test',
          description: `Scored ${test.overallScore || test.bandScore || 0} band`,
          icon: getTestIcon(test.skill || 'full'),
          color: getTestColor(test.skill || 'full'),
          date: test.date || test.dateTaken || new Date().toISOString(),
          score: test.overallScore || test.bandScore,
          skill: test.skill || 'full',
          testData: test // Save full test data for details view
        });
      });
      
      // Add milestone activities
      milestones.slice(0, 1).forEach(milestone => {
        allActivities.push({
          type: 'milestone',
          id: milestone.id || Date.now() + Math.random(),
          title: milestone.name || 'Achievement Unlocked',
          description: milestone.description || 'Great progress!',
          icon: '🏆',
          color: 'yellow',
          date: milestone.date || new Date().toISOString()
        });
      });
      
      // Add daily challenge activities
      dailyChallenges.slice(0, 1).forEach(challenge => {
        allActivities.push({
          type: 'challenge',
          id: challenge.id || Date.now() + Math.random(),
          title: 'Daily Challenge Completed',
          description: `Streak: ${challenge.streak || 0} days`,
          icon: '🔥',
          color: 'orange',
          date: challenge.date || new Date().toISOString()
        });
      });
      
      // Sort by date (most recent first)
      allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Get top 5 activities
      setActivities(allActivities.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error loading activities:', error);
      setLoading(false);
    }
  };

  const getTestIcon = (skill) => {
    const icons = {
      reading: '📖',
      writing: '✍️',
      listening: '🎧',
      speaking: '🎤',
      full: '📝',
      mixed: '🎯'
    };
    return icons[skill] || '📚';
  };

  const getTestColor = (skill) => {
    const colors = {
      reading: 'blue',
      writing: 'green',
      listening: 'purple',
      speaking: 'orange',
      full: 'indigo',
      mixed: 'pink'
    };
    return colors[skill] || 'gray';
  };

  const getActivityColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      pink: 'bg-pink-100 text-pink-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      gray: 'bg-gray-100 text-gray-600'
    };
    return colors[color] || colors.blue;
  };

  // Auto-update relative time every minute
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity & Tests</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.recentActivityTests')}</h2>
        <button 
          onClick={() => window.location.href = '/test-history'}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
        >
          {t('dashboard.viewAll')}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={activity.id} className="flex flex-col p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 rounded-2xl border border-gray-200/50 hover:border-blue-200/50 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${getActivityColor(activity.color)} rounded-xl flex items-center justify-center`}>
                  <span className="text-xl">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{activity.title}</h3>
                    <div className="text-right">
                      <span className="text-sm text-gray-500 block">
                        🕒 {formatRelativeTime(activity.date, true)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({formatLocalTime(activity.date)})
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  {activity.skill && activity.skill !== 'full' && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                      {activity.skill.toUpperCase()}
                    </span>
                  )}
                </div>
                {activity.score && (
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {activity.score}
                    </div>
                    <div className="text-xs text-gray-500">Band</div>
                  </div>
                )}
              </div>
              {/* View Details Button for tests */}
              {activity.type === 'test' && activity.testData && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Save test data to localStorage for TestResult to load
                      console.log('📊 Test data:', activity.testData);
                      localStorage.setItem('latestTestResult', JSON.stringify(activity.testData));
                      console.log('💾 Saved to localStorage');
                      // Navigate using React Router
                      navigate('/test/result');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>👁️</span>
                    <span>Xem chi tiết bài test</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.noActivityYet')}</h3>
            <p className="text-gray-600 mb-6">{t('dashboard.startFirstTest')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/test/start'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🚀 {t('dashboard.startTest')}
              </button>
              <button
                onClick={() => window.location.href = '/quick-practice/reading'}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                ⚡ {t('dashboard.quickPractice')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityAndTests;

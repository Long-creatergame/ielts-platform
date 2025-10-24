import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// ModernHeader removed to avoid duplicate headers
import ModernStatsCard from '../components/ModernStatsCard';
import Onboarding from '../components/Onboarding';
import QuickStart from '../components/QuickStart';
import HelpCenter from '../components/HelpCenter';

export default function ModernDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const { statistics } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Onboarding */}
      <Onboarding onComplete={() => setShowOnboarding(false)} />
      
      {/* Quick Start Modal */}
      {showQuickStart && (
        <QuickStart onClose={() => setShowQuickStart(false)} />
      )}
      
      {/* Help Center */}
      <HelpCenter isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />
      
      {/* Header removed - using main Navbar instead */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Ready to continue your IELTS journey? Let's practice and improve your skills.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ModernStatsCard
            title="Overall Band Score"
            value={statistics?.averageBand || 'N/A'}
            subtitle="Your current level"
            icon="🎯"
            color="blue"
            trend={{ positive: true, value: '+0.5' }}
          />
          <ModernStatsCard
            title="Tests Completed"
            value={statistics?.totalTests || '0'}
            subtitle="This month"
            icon="📝"
            color="green"
            trend={{ positive: true, value: '+3' }}
          />
          <ModernStatsCard
            title="Study Streak"
            value={`${statistics?.studyStreak || '0'} days`}
            subtitle="Keep it up!"
            icon="🔥"
            color="orange"
            trend={{ positive: true, value: '+2' }}
          />
          <ModernStatsCard
            title="Time Spent"
            value={`${statistics?.totalTime || '0'}h`}
            subtitle="This month"
            icon="⏱️"
            color="purple"
            trend={{ positive: true, value: '+5h' }}
          />
        </div>

        {/* Quick Actions - Short, Simple Practice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">⚡ Quick Actions</h2>
            <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">5-10 min</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Quick practice sessions to warm up or fill short breaks</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/quick-practice/reading')}
              className="flex items-center space-x-3 p-4 rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-100 transition-colors bg-white"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📖</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Quick Reading</p>
                <p className="text-sm text-gray-500">Short passages & questions</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/quick-practice/listening')}
              className="flex items-center space-x-3 p-4 rounded-lg border border-green-200 hover:border-green-300 hover:bg-green-100 transition-colors bg-white"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🎧</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Quick Listening</p>
                <p className="text-sm text-gray-500">Short audio clips</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/quick-practice/writing')}
              className="flex items-center space-x-3 p-4 rounded-lg border border-yellow-200 hover:border-yellow-300 hover:bg-yellow-100 transition-colors bg-white"
            >
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">✍️</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Quick Writing</p>
                <p className="text-sm text-gray-500">Short writing tasks</p>
              </div>
            </button>
          </div>
        </div>

        {/* Practice Tests - Full IELTS Format */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">📚 Practice Tests</h2>
              <p className="text-sm text-gray-600 mt-1">Full IELTS format tests with detailed assessment</p>
            </div>
            <button
              onClick={() => navigate('/test/start')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all tests →
            </button>
          </div>
          {/* Single Full IELTS Test Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">🎯 Full IELTS Test</h3>
                <p className="text-blue-100 mb-4">Complete 4-skills IELTS test with authentic format</p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    <span>Reading (60 min)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    <span>Listening (40 min)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    <span>Writing (60 min)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    <span>Speaking (15 min)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">2.5h</div>
                <div className="text-blue-100 text-sm">Total Duration</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
                  📊 Detailed Assessment
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
                  🎯 Band Score
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
                  💡 AI Feedback
                </div>
              </div>
              <button
                onClick={() => navigate('/test/start')}
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Start Full Test →
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {statistics?.recentTests?.length > 0 ? (
              statistics.recentTests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm">📝</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{test.skill} Test</p>
                      <p className="text-sm text-gray-500">{test.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Band {test.score}</p>
                    <p className="text-sm text-gray-500">{test.level} Level</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">Start your first test to see your progress here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

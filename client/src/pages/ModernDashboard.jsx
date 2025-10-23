import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ModernHeader from '../components/ModernHeader';
import ModernStatsCard from '../components/ModernStatsCard';
import ModernTestCard from '../components/ModernTestCard';
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

  const handleStartTest = (test) => {
    navigate(`/test/${test.skill}?level=${test.level}`);
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
  const tests = [
    { skill: 'reading', level: '6.5', duration: '60 min', description: 'Academic Reading Test', completed: false },
    { skill: 'listening', level: '6.5', duration: '40 min', description: 'Academic Listening Test', completed: false },
    { skill: 'writing', level: '6.5', duration: '60 min', description: 'Academic Writing Test', completed: false },
    { skill: 'speaking', level: '6.5', duration: '15 min', description: 'Academic Speaking Test', completed: false }
  ];

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
      
      {/* Modern Header */}
      <ModernHeader 
        user={user}
        onQuickStart={() => setShowQuickStart(true)}
        onHelp={() => setShowHelpCenter(true)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-gray-600">
            Ready to continue your IELTS journey? Let's practice and improve your skills.
          </p>
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
            value={statistics?.studyStreak || '0'} + " days"
            subtitle="Keep it up!"
            icon="🔥"
            color="orange"
            trend={{ positive: true, value: '+2' }}
          />
          <ModernStatsCard
            title="Time Spent"
            value={statistics?.totalTime || '0'} + "h"
            subtitle="This month"
            icon="⏱️"
            color="purple"
            trend={{ positive: true, value: '+5h' }}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/test/reading')}
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📖</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Reading Test</p>
                <p className="text-sm text-gray-500">Practice reading skills</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/test/listening')}
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🎧</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Listening Test</p>
                <p className="text-sm text-gray-500">Practice listening skills</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/test/writing')}
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">✍️</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Writing Test</p>
                <p className="text-sm text-gray-500">Practice writing skills</p>
              </div>
            </button>
          </div>
        </div>

        {/* Practice Tests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Practice Tests</h2>
            <button
              onClick={() => navigate('/test-intro')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all tests →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tests.map((test, index) => (
              <ModernTestCard
                key={index}
                test={test}
                onStart={handleStartTest}
              />
            ))}
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

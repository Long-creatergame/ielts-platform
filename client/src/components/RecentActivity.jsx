import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RecentActivity = () => {
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentTests();
  }, []);

  const loadRecentTests = async () => {
    try {
      // Load from localStorage first
      const localStorageTests = JSON.parse(localStorage.getItem('testHistory') || '[]');
      const sessionStorageTests = JSON.parse(sessionStorage.getItem('testHistory') || '[]');
      
      // Use localStorage if available, otherwise use sessionStorage
      const savedTests = localStorageTests.length > 0 ? localStorageTests : sessionStorageTests;
      
      console.log('🔍 Debug: Recent Activity - Saved tests:', savedTests);
      
      // Get recent 3 tests
      const recent = savedTests.slice(0, 3);
      console.log('🔍 Debug: Recent Activity - Recent tests:', recent);
      
      setRecentTests(recent);
      setLoading(false);
    } catch (error) {
      console.error('Error loading recent tests:', error);
      setLoading(false);
    }
  };

  const getSkillIcon = (skill) => {
    const icons = {
      reading: '📖',
      listening: '🎧',
      writing: '✍️',
      speaking: '🗣️'
    };
    return icons[skill] || '📚';
  };

  const getBandColor = (band) => {
    if (band >= 7) return 'text-green-600 bg-green-100';
    if (band >= 6) return 'text-blue-600 bg-blue-100';
    if (band >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        <Link
          to="/test-history"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All
        </Link>
      </div>
      
      <div className="space-y-4">
        {recentTests.length > 0 ? (
          recentTests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📝</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{test.testType || 'IELTS Test'}</p>
                  <p className="text-sm text-gray-500">{test.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBandColor(test.overallScore || 0)}`}>
                  Band {test.overallScore || 0}
                </span>
                <span className="text-gray-400">→</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-gray-500 font-medium">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">Start your first test to see your progress here</p>
            <Link
              to="/dashboard"
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Test
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;

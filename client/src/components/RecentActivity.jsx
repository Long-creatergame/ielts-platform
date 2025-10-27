import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      // Load tests from localStorage
      const localStorageTests = JSON.parse(localStorage.getItem('testHistory') || '[]');
      const sessionStorageTests = JSON.parse(sessionStorage.getItem('testHistory') || '[]');
      const savedTests = localStorageTests.length > 0 ? localStorageTests : sessionStorageTests;
      
      // Load milestones from localStorage
      const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
      
      // Load daily challenges
      const dailyChallenges = JSON.parse(localStorage.getItem('dailyChallenges') || '[]');
      
      // Combine all activities
      const allActivities = [];
      
      // Add test activities
      savedTests.slice(0, 2).forEach(test => {
        allActivities.push({
          type: 'test',
          id: test.id || Date.now(),
          title: test.testType || 'IELTS Test',
          description: `Scored ${test.overallScore || 0} band`,
          icon: '📝',
          color: 'blue',
          date: test.date,
          score: test.overallScore
        });
      });
      
      // Add milestone activities
      milestones.slice(0, 1).forEach(milestone => {
        allActivities.push({
          type: 'milestone',
          id: milestone.id || Date.now(),
          title: milestone.name || 'Achievement Unlocked',
          description: milestone.description || 'Great progress!',
          icon: '🏆',
          color: 'yellow',
          date: milestone.date
        });
      });
      
      // Add daily challenge activities
      dailyChallenges.slice(0, 1).forEach(challenge => {
        allActivities.push({
          type: 'challenge',
          id: challenge.id || Date.now(),
          title: 'Daily Challenge Completed',
          description: `Streak: ${challenge.streak || 0} days`,
          icon: '🔥',
          color: 'orange',
          date: challenge.date
        });
      });
      
      // Sort by date (most recent first)
      allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Get top 3 activities
      setActivities(allActivities.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('Error loading activities:', error);
      setLoading(false);
    }
  };

  const getActivityColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      orange: 'bg-orange-100 text-orange-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colors[color] || colors.blue;
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
      
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={`w-10 h-10 ${getActivityColor(activity.color)} rounded-lg flex items-center justify-center`}>
                <span className="text-lg">{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                <p className="text-sm text-gray-500 truncate">{activity.description}</p>
              </div>
              {activity.score && (
                <div className="flex-shrink-0">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                    {activity.score} band
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-gray-500 font-medium">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">Start your first test to see your progress here</p>
            <button
              onClick={() => window.location.href = '/test/start'}
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;

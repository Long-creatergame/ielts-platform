import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../api/dashboard';
import ScoreCard from '../components/ScoreCard';
import Loader from '../components/Loader';
import ProgressRing from '../components/ProgressRing';
import LevelBadge from '../components/LevelBadge';
import GoalProgressBar from '../components/GoalProgressBar';
import CoachMessage from '../components/CoachMessage';
import UpgradeBanner from '../components/UpgradeBanner';
import SmartUpgradePrompt from '../components/SmartUpgradePrompt';
import AIPractice from '../components/AIPractice';
import MyWeakness from '../components/MyWeakness';
import RecommendedPractice from '../components/RecommendedPractice';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Function to refresh dashboard data
  const refreshDashboardData = async () => {
    try {
      if (user) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const token = localStorage.getItem('token');
        
        // Fetch dashboard data from API
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      }
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user) {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
          const token = localStorage.getItem('token');
          
          // Fetch dashboard data from API
          const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setDashboardData(data);
          } else {
            // Fallback to mock data if API fails
            const mockData = {
              user: {
                name: user.name,
                email: user.email,
                goal: user.goal || 'Thử sức',
                targetBand: user.targetBand || 6.5,
                currentLevel: user.currentLevel || 'A2',
                paid: user.paid || false,
                freeTestsUsed: user.freeTestsUsed || 0
              },
              statistics: {
                totalTests: 0,
                completedTests: 0,
                averageBand: 0,
                streakDays: 0
              },
              recentTests: [],
              coachMessage: {
                message: "🤖 AI Coach: Welcome to IELTS Platform! Start your first test to get personalized feedback.",
                type: "welcome"
              }
            };
            setDashboardData(mockData);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use fallback data
        setDashboardData({
          user: user,
          statistics: { totalTests: 0, completedTests: 0, averageBand: 0, streakDays: 0 },
          recentTests: [],
          coachMessage: { message: "🤖 AI Coach: Ready to help you improve!", type: "ready" }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);


  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">🎯 IELTS Platform</h1>
          <p className="text-lg text-gray-600 mb-8">Please login to access your dashboard</p>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const { statistics, personalization } = dashboardData || {};
  const greeting = personalization?.greeting || `👋 Chào ${user.name}!`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Monetization Components */}
        <UpgradeBanner user={user} />
        <SmartUpgradePrompt />

        {/* Personalized Greeting */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {greeting}
          </h1>
          <div className="flex items-center space-x-4">
            <LevelBadge level={user.currentLevel} size="lg" />
            <span className="text-lg text-gray-600">
              Mục tiêu: Band {user.targetBand} | Hiện tại: Band {statistics?.averageBand || 'N/A'}
            </span>
          </div>
        </div>

        {/* Goal Progress Bar */}
        <div className="mb-8">
          <GoalProgressBar
            current={statistics?.averageBand || 0}
            target={user.targetBand}
            goal={user.goal}
          />
        </div>

        {/* AI Engine Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setActiveTab('ai-practice')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ai-practice'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🧩 AI Practice
                </button>
                <button
                  onClick={() => setActiveTab('my-weakness')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'my-weakness'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 My Weakness
                </button>
                <button
                  onClick={() => setActiveTab('recommended')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'recommended'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  💡 Recommended Practice
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  {/* Coach Message */}
                  {personalization?.coachMessage && (
                    <div className="mb-8">
                      <CoachMessage message={personalization.coachMessage} />
                    </div>
                  )}

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <ScoreCard
                      title="Tests Completed"
                      score={statistics?.totalTests || 0}
                      color="blue"
                    />
                    <ScoreCard
                      title="Average Band"
                      score={statistics?.averageBand || 'N/A'}
                      color="green"
                    />
                    <ScoreCard
                      title="Streak Days"
                      score={user.streakDays || 0}
                      color="purple"
                    />
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                      <div className="text-4xl mb-2">🎯</div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">Target Band</h3>
                      <p className="text-3xl font-bold text-orange-600">
                        {user.targetBand}
                      </p>
                    </div>
                  </div>

                  {/* Progress Ring */}
                  {statistics?.averageBand > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Progress Overview</h2>
                      <ProgressRing
                        current={statistics.averageBand}
                        target={user.targetBand}
                        size={150}
                      />
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Link
                      to="/test/start"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="text-4xl mb-3">📝</div>
                      <h3 className="text-xl font-bold mb-2">Start New Test</h3>
                      <p className="text-blue-100">Take a practice test</p>
                    </Link>

                    <Link
                      to="/profile"
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="text-4xl mb-3">👤</div>
                      <h3 className="text-xl font-bold mb-2">View Profile</h3>
                      <p className="text-green-100">Manage your account</p>
                    </Link>

                    <Link
                      to="/pricing"
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="text-4xl mb-3">💎</div>
                      <h3 className="text-xl font-bold mb-2">Upgrade Plan</h3>
                      <p className="text-purple-100">Unlock premium features</p>
                    </Link>
                  </div>

                  {/* Recent Tests */}
                  {dashboardData?.recentTests && dashboardData.recentTests.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Tests</h2>
                      <div className="space-y-4">
                        {dashboardData.recentTests.slice(0, 5).map((test, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl">
                                {test.skill === 'reading' ? '📖' :
                                 test.skill === 'writing' ? '✍️' :
                                 test.skill === 'listening' ? '🎧' : '🎤'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800 capitalize">
                                  {test.skill} Test
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {new Date(test.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {test.bandScore}
                              </div>
                              <div className="text-sm text-gray-600">Band Score</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'ai-practice' && (
                <AIPractice />
              )}
              
              {activeTab === 'my-weakness' && (
                <MyWeakness />
              )}
              
              {activeTab === 'recommended' && (
                <RecommendedPractice />
              )}
            </div>
          </div>
        </div>

        {/* Coach Message */}
        {personalization?.coachMessage && (
          <div className="mb-8">
            <CoachMessage message={personalization.coachMessage} />
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ScoreCard
            title="Tests Completed"
            score={statistics?.totalTests || 0}
            color="blue"
          />
          <ScoreCard
            title="Average Band"
            score={statistics?.averageBand || 'N/A'}
            color="green"
          />
          <ScoreCard
            title="Streak Days"
            score={user.streakDays || 0}
            color="purple"
          />
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Target Band</h3>
            <p className="text-3xl font-bold text-orange-600">
              {user.targetBand}
            </p>
          </div>
        </div>

        {/* Progress Ring */}
        {statistics?.averageBand > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Progress Overview</h2>
            <ProgressRing
              current={statistics.averageBand}
              target={user.targetBand}
              size={150}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/test/start"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-center"
            >
              🎯 Take New Test
            </Link>
            <Link
              to="/profile"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-center"
            >
              👤 View Profile
            </Link>
            {statistics?.latestTest && (
              <Link
                to={`/test/result/${statistics.latestTest._id}`}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-center"
              >
                📊 Latest Results
              </Link>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {personalization?.recommendations && personalization.recommendations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">💡 Recommendations</h2>
            <div className="space-y-3">
              {personalization.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 mr-3">•</span>
                  <span className="text-blue-800">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test History */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Tests</h2>
          {dashboardData?.tests?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.tests.map((test, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Test #{dashboardData.tests.length - index}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(test.dateTaken).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {test.totalBand}
                      </p>
                      <p className="text-sm text-gray-600">Overall Band</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              No tests taken yet. Start your first test!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
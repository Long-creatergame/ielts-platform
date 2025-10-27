import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
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
import AIRecommendations from '../components/AIRecommendations';
import ProgressDashboard from '../components/ProgressDashboard';
import Onboarding from '../components/Onboarding';
import QuickStart from '../components/QuickStart';
import TestSelector from '../components/TestSelector';
import RecentActivity from '../components/RecentActivity';
import FeatureGuide from '../components/FeatureGuide';
import HelpCenter from '../components/HelpCenter';
import WelcomeBanner from '../components/WelcomeBanner';
import ModernHeader from '../components/ModernHeader';
import ModernStatsCard from '../components/ModernStatsCard';
import ModernTestCard from '../components/ModernTestCard';
import DailyChallenge from '../components/DailyChallenge';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showTestSelector, setShowTestSelector] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      {/* Onboarding */}
      <Onboarding onComplete={() => setShowOnboarding(false)} />
      
      {/* Quick Start Modal */}
      {showQuickStart && (
        <QuickStart onClose={() => setShowQuickStart(false)} />
      )}
      
      {/* Test Selector Modal */}
      {showTestSelector && (
        <TestSelector onClose={() => setShowTestSelector(false)} />
      )}
      
      {/* Help Center */}
      <HelpCenter isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🎯</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <LevelBadge level={user.currentLevel} size="sm" />
                  <span className="text-sm text-gray-600">
                    Target: Band {user.targetBand} | Current: {statistics?.averageBand > 0 ? `Band ${statistics.averageBand.toFixed(1)}` : 'No tests yet'}
                  </span>
                </div>
              </div>
            </div>
                     <div className="flex items-center space-x-3">
                       <button
                         onClick={() => setShowTestSelector(true)}
                         className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                       >
                         🎯 {t('nav.tests')}
                       </button>
                       <button
                         onClick={() => setShowHelpCenter(true)}
                         className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                       >
                         📚 {t('common.help', 'Help')}
                       </button>
                       <div className="hidden md:block">
                         <GoalProgressBar
                           current={statistics?.averageBand > 0 ? statistics.averageBand : 0}
                           target={user.targetBand}
                           goal={user.goal}
                         />
                       </div>
                     </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner for New Users */}
        <WelcomeBanner 
          onStartOnboarding={() => setShowOnboarding(true)}
          onQuickStart={() => setShowQuickStart(true)}
        />
        {/* Monetization Components */}
        <div className="mb-8">
          <UpgradeBanner user={user} />
          <SmartUpgradePrompt />
        </div>

        {/* AI Engine Tabs */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Tab Navigation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/50">
              <nav className="flex overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">📊</span>
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai-practice')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'ai-practice'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">🧩</span>
                  <span>AI Practice</span>
                </button>
                <button
                  onClick={() => setActiveTab('my-weakness')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'my-weakness'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">📈</span>
                  <span>My Weakness</span>
                </button>
                <button
                  onClick={() => setActiveTab('recommended')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'recommended'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">💡</span>
                  <span>Recommended</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai-recommendations')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'ai-recommendations'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">🤖</span>
                  <span>AI Recommendations</span>
                </button>
                <button
                  onClick={() => setActiveTab('progress-tracking')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'progress-tracking'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">📊</span>
                  <span>Progress Tracking</span>
                </button>
              </nav>
            </div>
            
            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Coach Message */}
                  {personalization?.coachMessage && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                      <CoachMessage message={personalization.coachMessage} />
                    </div>
                  )}

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Tests Completed</p>
                          <p className="text-3xl font-bold">{statistics?.totalTests || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">📝</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium">Average Band</p>
                          <p className="text-3xl font-bold">{statistics?.averageBand || 'N/A'}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">📊</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium">Streak Days</p>
                          <p className="text-3xl font-bold">{user.streakDays || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🔥</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm font-medium">Target Band</p>
                          <p className="text-3xl font-bold">{user.targetBand}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🎯</span>
                        </div>
                      </div>
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

                  {/* Daily Challenge - First Priority */}
                  <DailyChallenge />

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                      to="/quick-practice/reading"
                      className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <span className="text-3xl">📝</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Quick Reading</h3>
                          <p className="text-blue-100 text-sm">Quick reading practice</p>
                        </div>
                      </div>
                      <div className="flex items-center text-blue-100 text-sm font-medium">
                        <span>Begin Practice</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>

                    <Link
                      to="/quick-practice/writing"
                      className="group bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <span className="text-3xl">✍️</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Quick Writing</h3>
                          <p className="text-green-100 text-sm">Quick writing practice</p>
                        </div>
                      </div>
                      <div className="flex items-center text-green-100 text-sm font-medium">
                        <span>Begin Practice</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>

                    <Link
                      to="/quick-practice/listening"
                      className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <span className="text-3xl">💎</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Quick Listening</h3>
                          <p className="text-purple-100 text-sm">Quick listening practice</p>
                        </div>
                      </div>
                      <div className="flex items-center text-purple-100 text-sm font-medium">
                        <span>Begin Practice</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </div>

                  {/* Combined Activity & Tests Section */}
                  <div className="space-y-6">
                    <RecentActivity />
                    
                    {/* Recent Tests - Only show if there are tests */}
                    {dashboardData?.recentTests && dashboardData.recentTests.length > 0 && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-bold text-gray-800">Recent Tests</h2>
                          <Link 
                            to="/test-history" 
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            View All
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {dashboardData.recentTests.slice(0, 6).map((test, index) => (
                            <div key={index} className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 rounded-2xl p-6 border border-gray-200/50 hover:border-blue-200/50 transition-all duration-300 hover:shadow-lg">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl">
                                    {test.skill === 'reading' ? '📖' :
                                     test.skill === 'writing' ? '✍️' :
                                     test.skill === 'listening' ? '🎧' : '🎤'}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-gray-800 capitalize text-lg">
                                      {test.skill} Test
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {new Date(test.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-right">
                                  <div className="text-3xl font-bold text-blue-600">
                                    {test.bandScore}
                                  </div>
                                  <div className="text-sm text-gray-600">Band Score</div>
                                </div>
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
                       {activeTab === 'ai-practice' && (
                         <FeatureGuide feature="ai-practice">
                           <AIPractice />
                         </FeatureGuide>
                       )}

                       {activeTab === 'my-weakness' && (
                         <FeatureGuide feature="weakness-analysis">
                           <MyWeakness />
                         </FeatureGuide>
                       )}

                       {activeTab === 'recommended' && (
                         <FeatureGuide feature="recommendations">
                           <RecommendedPractice />
                         </FeatureGuide>
                       )}

                       {activeTab === 'ai-recommendations' && (
                         <FeatureGuide feature="ai-recommendations">
                           <AIRecommendations />
                         </FeatureGuide>
                       )}

                       {activeTab === 'progress-tracking' && (
                         <FeatureGuide feature="progress-tracking">
                           <ProgressDashboard />
                         </FeatureGuide>
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

        {/* Statistics Cards - Removed duplicate */}

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

        {/* Quick Actions - Removed duplicate */}

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
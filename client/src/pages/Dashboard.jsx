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
import FreeTrialProgress from '../components/FreeTrialProgress';
import PremiumFeatureLock from '../components/PremiumFeatureLock';
import LimitedAccess from '../components/LimitedAccess';
import AIPractice from '../components/AIPractice';
import AIPersonalization from '../components/AIPersonalization';
import MyWeakness from '../components/MyWeakness';
import UnifiedRecommendations from '../components/UnifiedRecommendations';
import UnifiedProgressTracking from '../components/UnifiedProgressTracking';
import { FEATURE_ACCESS } from '../utils/featureAccess';
import Onboarding from '../components/Onboarding';
import QuickStart from '../components/QuickStart';
import TestSelector from '../components/TestSelector';
import RecentActivityAndTests from '../components/RecentActivityAndTests';
import FeatureGuide from '../components/FeatureGuide';
import HelpCenter from '../components/HelpCenter';
import WelcomeBanner from '../components/WelcomeBanner';
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

  // User authentication is now handled by ProtectedRoute

  const { statistics, personalization } = dashboardData || {};
  const greeting = personalization?.greeting || `${t('dashboard.greeting')} ${user.name}!`;

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
                    {t('dashboard.target')}: Band {user.targetBand} | {t('dashboard.current')}: {statistics?.averageBand > 0 ? `Band ${statistics.averageBand.toFixed(1)}` : t('dashboard.noTestsYet')}
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
        {/* Trial Progress & Monetization Components */}
        <div className="mb-8">
          <FreeTrialProgress user={user} />
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
                  <span>{t('dashboard.overview')}</span>
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
                  <span>{t('dashboard.aiPractice')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('my-weakness')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'my-weakness'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">🔍</span>
                  <span>{t('dashboard.myWeakness')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'recommendations'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">💡</span>
                  <span>{t('dashboard.recommendations', 'Recommendations')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai-personalization')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'ai-personalization'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">🎯</span>
                  <span>{t('aiPersonalization.title', 'AI Personalization')}</span>
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
                  <span>{t('dashboard.progressTracking')}</span>
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
                          <p className="text-blue-100 text-sm font-medium">{t('dashboard.testsCompleted')}</p>
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
                          <p className="text-green-100 text-sm font-medium">{t('dashboard.averageBand')}</p>
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
                          <p className="text-purple-100 text-sm font-medium">{t('dashboard.streakDays')}</p>
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
                          <p className="text-orange-100 text-sm font-medium">{t('dashboard.targetBand')}</p>
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
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('dashboard.progressOverview')}</h2>
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
                    <button
                      onClick={() => window.location.href = '/quick-practice/reading'}
                      className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <span className="text-3xl">📝</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{t('dashboard.quickReading')}</h3>
                          <p className="text-blue-100 text-sm">{t('dashboard.quickReadingDesc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-blue-100 text-sm font-medium">
                        <span>{t('dashboard.beginPractice')}</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>

                    <button
                      onClick={() => window.location.href = '/quick-practice/writing'}
                      className="group bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <span className="text-3xl">✍️</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{t('dashboard.quickWriting')}</h3>
                          <p className="text-green-100 text-sm">{t('dashboard.quickWritingDesc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-green-100 text-sm font-medium">
                        <span>{t('dashboard.beginPractice')}</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>

                    <button
                      onClick={() => window.location.href = '/quick-practice/listening'}
                      className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <span className="text-3xl">💎</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{t('dashboard.quickListening')}</h3>
                          <p className="text-purple-100 text-sm">{t('dashboard.quickListeningDesc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-purple-100 text-sm font-medium">
                        <span>{t('dashboard.beginPractice')}</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </div>

                  {/* Combined Activity & Tests Section */}
                  <RecentActivityAndTests />
                </div>
              )}
              
                       {activeTab === 'ai-practice' && (
                         <LimitedAccess feature={FEATURE_ACCESS.FREE.LIMITED_AI_PRACTICE}>
                           <AIPractice />
                         </LimitedAccess>
                       )}

                       {activeTab === 'ai-personalization' && (
                         <PremiumFeatureLock feature={FEATURE_ACCESS.PREMIUM.AI_PERSONALIZATION}>
                           <AIPersonalization />
                         </PremiumFeatureLock>
                       )}

                       {activeTab === 'my-weakness' && (
                         <PremiumFeatureLock feature={FEATURE_ACCESS.PREMIUM.WEAKNESS_ANALYSIS}>
                           <MyWeakness />
                         </PremiumFeatureLock>
                       )}

                       {activeTab === 'recommendations' && (
                         <PremiumFeatureLock feature={FEATURE_ACCESS.PREMIUM.ADVANCED_RECOMMENDATIONS}>
                           <UnifiedRecommendations />
                         </PremiumFeatureLock>
                       )}

                       {activeTab === 'progress-tracking' && (
                         <PremiumFeatureLock feature={FEATURE_ACCESS.PREMIUM.DETAILED_PROGRESS}>
                           <UnifiedProgressTracking />
                         </PremiumFeatureLock>
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

      </div>
    </div>
  );
}
import React, { useState, useEffect, lazy, Suspense } from 'react';
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
import { FEATURE_ACCESS } from '../utils/featureAccess';
import Onboarding from '../components/Onboarding';
import QuickStart from '../components/QuickStart';
// TestSelector removed - too confusing for users
import RecentActivityAndTests from '../components/RecentActivityAndTests';
import HelpCenter from '../components/HelpCenter';
import WelcomeBanner from '../components/WelcomeBanner';
import ModernStatsCard from '../components/ModernStatsCard';
import ModernTestCard from '../components/ModernTestCard';
import DailyChallenge from '../components/DailyChallenge';
import RealtimeClient from '../components/RealtimeClient';
import StickyPricingCTA from '../components/StickyPricingCTA';
import WeeklyReport from '../components/WeeklyReport';
import { useNavigate, useLocation } from 'react-router-dom';

// Lazy load heavy components for better initial load performance
const AIPractice = lazy(() => import('../components/AIPractice'));
const AIPersonalization = lazy(() => import('../components/AIPersonalization'));
const MyWeakness = lazy(() => import('../components/MyWeakness'));
const UnifiedRecommendations = lazy(() => import('../components/UnifiedRecommendations'));
const UnifiedProgressTracking = lazy(() => import('../components/UnifiedProgressTracking'));
const LearningPath = lazy(() => import('../pages/LearningPath'));
const PracticePlan = lazy(() => import('../components/PracticePlan'));
const BandProgressChart = lazy(() => import('../components/BandProgressChart'));
const DashboardAI = lazy(() => import('../components/dashboard/DashboardAI'));
const FeedbackHistory = lazy(() => import('../components/feedback/FeedbackHistory'));
const AICoachCard = lazy(() => import('../components/dashboard/AICoachCard'));
const AISupervisorPanel = lazy(() => import('../components/dashboard/AISupervisorPanel'));
const MotivationPanel = lazy(() => import('../components/MotivationPanel'));

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  // Removed showTestSelector - simplified UX

  // Memoize API base URL to avoid recalculation
  const API_BASE_URL = React.useMemo(() => 
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000', 
    []
  );

  // Function to refresh dashboard data
  const refreshDashboardData = React.useCallback(async () => {
    try {
      if (user) {
        const token = localStorage.getItem('token');
        
        console.log('🔄 Refreshing dashboard data...');
        
        // Fetch dashboard data from API
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.data || result; // Handle both {success, data} and direct data
          console.log('✅ Dashboard data refreshed:', data);
          setDashboardData(data);
        } else {
          console.error('❌ Dashboard fetch failed:', response.status);
        }
      }
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  }, [user, API_BASE_URL]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user) {
          const token = localStorage.getItem('token');
          
          // Fetch dashboard data from API
          const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            const data = result.data || result; // Handle both {success, data} and direct data
            console.log('✅ Dashboard loaded:', data);
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
  }, [user, API_BASE_URL]);

  // Refresh dashboard when navigating to this page
  useEffect(() => {
    if (location.pathname === '/dashboard' && !loading && user) {
      refreshDashboardData();
    }
  }, [location.pathname, loading, user, refreshDashboardData]);

  if (loading) {
    return <Loader />;
  }

  // User authentication is now handled by ProtectedRoute

  const { statistics, personalization } = dashboardData || {};
  const greeting = personalization?.greeting || `${t('dashboard.greeting')} ${user.name}!`;

  return (
    <div className="min-h-screen bg-gray-50">
      <RealtimeClient
        onTestStarted={() => refreshDashboardData()}
        onTestCompleted={() => refreshDashboardData()}
      />
      {/* Onboarding */}
      <Onboarding onComplete={() => setShowOnboarding(false)} />
      
      {/* Quick Start Modal */}
      {showQuickStart && (
        <QuickStart onClose={() => setShowQuickStart(false)} />
      )}
      
      {/* Test Selector Modal - REMOVED: Too confusing! */}
      
      {/* Help Center */}
      <HelpCenter isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-30">
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
                       <Link
                         to="/test/start"
                         className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                       >
                         🎯 {t('nav.tests')}
                       </Link>
                      {/* Help button moved to Navbar to avoid duplication */}
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
        {/* Leaderboard CTA */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/leaderboard')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            🏆 Xem bảng xếp hạng
          </button>
        </div>
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
                  onClick={() => setActiveTab('practice-plan')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'practice-plan'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">🎯</span>
                  <span>Practice Plan</span>
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
                <button
                  onClick={() => setActiveTab('learning-path')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'learning-path'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">🗺️</span>
                  <span>{t('dashboard.learningPath', 'Learning Path')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('band-progress')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'band-progress'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">📈</span>
                  <span>Band Progress</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai-analytics')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'ai-analytics'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">🤖</span>
                  <span>AI Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('feedback-history')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'feedback-history'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">📊</span>
                  <span>Feedback History</span>
                </button>
              </nav>
            </div>
            
            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Motivation Panel */}
                  <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                    <MotivationPanel userId={user._id} />
                  </Suspense>

                  {/* AI Coach Card */}
                  <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                    <AICoachCard userId={user._id} />
                  </Suspense>

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

                  {/* AI Supervisor Panel */}
                  <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="lg:col-span-2">
                        <AISupervisorPanel userId={user._id} />
                      </div>
                    </div>
                  </Suspense>

                  {/* Quick Practice Group */}
                  <div className="bg-white rounded-3xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Quick Practice</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => window.location.href = '/quick-practice/reading'}
                        className="btn-secondary px-4 py-3 flex items-center justify-center gap-2"
                      >
                        <span>📝</span>
                        <span>Practice Reading</span>
                      </button>
                      <button
                        onClick={() => window.location.href = '/quick-practice/writing'}
                        className="btn-secondary px-4 py-3 flex items-center justify-center gap-2"
                      >
                        <span>✍️</span>
                        <span>Practice Writing</span>
                      </button>
                      <button
                        onClick={() => window.location.href = '/quick-practice/listening'}
                        className="btn-secondary px-4 py-3 flex items-center justify-center gap-2"
                      >
                        <span>🎧</span>
                        <span>Practice Listening</span>
                      </button>
                    </div>
                  </div>

                  {/* Combined Activity & Tests Section */}
                  <RecentActivityAndTests />
                </div>
              )}
              
                       {activeTab === 'ai-practice' && (
                         <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                           <LimitedAccess feature={FEATURE_ACCESS.FREE.LIMITED_AI_PRACTICE}>
                             <AIPractice />
                           </LimitedAccess>
                         </Suspense>
                       )}

                       {activeTab === 'ai-personalization' && (
                         <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                           <PremiumFeatureLock feature={FEATURE_ACCESS.PREMIUM.AI_PERSONALIZATION}>
                             <AIPersonalization />
                           </PremiumFeatureLock>
                         </Suspense>
                       )}

                       {activeTab === 'my-weakness' && (
                         <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                           <PremiumFeatureLock feature={FEATURE_ACCESS.PREMIUM.WEAKNESS_ANALYSIS}>
                             <MyWeakness />
                           </PremiumFeatureLock>
                         </Suspense>
                       )}

                       {activeTab === 'practice-plan' && (
                         <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                           <PracticePlan />
                         </Suspense>
                       )}

                       {activeTab === 'progress-tracking' && (
                         <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                           <PremiumFeatureLock feature={FEATURE_ACCESS.PREMIUM.DETAILED_PROGRESS}>
                             <UnifiedProgressTracking />
                           </PremiumFeatureLock>
                         </Suspense>
                       )}

                       {activeTab === 'learning-path' && (
                         <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                           <LearningPath />
                         </Suspense>
                       )}

                       {activeTab === 'band-progress' && (
                         <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                           <BandProgressChart />
                         </Suspense>
                       )}

                       {activeTab === 'ai-analytics' && (
                         <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                           <DashboardAI user={user} isLoading={loading} />
                         </Suspense>
                       )}

                       {activeTab === 'feedback-history' && (
                         <Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
                           <FeedbackHistory userId={user._id} />
                         </Suspense>
                       )}
            </div>
          </div>
        </div>

      </div>
      
      {/* Sticky Pricing CTA */}
      <StickyPricingCTA />
    </div>
  );
}
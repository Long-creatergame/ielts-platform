import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const AIPersonalization = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [personalization, setPersonalization] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPersonalizationData();
    }
  }, [user]);

  const fetchPersonalizationData = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      // Fetch all personalization data in parallel
      const [profileRes, studyPlanRes, recommendationsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/ai-personalization/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/ai-personalization/study-plan`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/ai-personalization/recommendations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/ai-personalization/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setPersonalization(profileData.data);
      }

      if (studyPlanRes.ok) {
        const studyPlanData = await studyPlanRes.json();
        setStudyPlan(studyPlanData.data);
      }

      if (recommendationsRes.ok) {
        const recommendationsData = await recommendationsRes.json();
        setRecommendations(recommendationsData.data);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.data);
      }

    } catch (error) {
      console.error('Fetch personalization data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRecommendationStatus = async (recommendationId, status) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/ai-personalization/recommendations/${recommendationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Refresh recommendations
        fetchPersonalizationData();
      }
    } catch (error) {
      console.error('Update recommendation status error:', error);
    }
  };

  const triggerAnalysis = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/ai-personalization/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh all data
        await fetchPersonalizationData();
      }
    } catch (error) {
      console.error('Trigger analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🤖 {t('aiPersonalization.title', 'AI Personalization')}</h2>
            <p className="text-purple-100">{t('aiPersonalization.subtitle', 'Your personalized learning experience powered by AI')}</p>
          </div>
          <button
            onClick={triggerAnalysis}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
          >
            🔄 {t('aiPersonalization.refreshAnalysis', 'Refresh Analysis')}
          </button>
        </div>
      </div>

      {/* Study Plan */}
      {studyPlan && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📚 {t('aiPersonalization.studyPlan', 'Your Study Plan')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">{t('aiPersonalization.dailyGoal', 'Daily Goal')}</h4>
              <p className="text-blue-800 text-sm">
                {t('aiPersonalization.studyTime', 'Study Time')}: {studyPlan.dailyGoal.timeSpent} {t('common.minutes', 'minutes')}
              </p>
              <p className="text-blue-800 text-sm">
                {t('aiPersonalization.questions', 'Questions')}: {studyPlan.dailyGoal.questions}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-semibold text-green-900 mb-2">{t('aiPersonalization.weeklyGoal', 'Weekly Goal')}</h4>
              <p className="text-green-800 text-sm">
                {t('aiPersonalization.tests', 'Tests')}: {studyPlan.weeklyGoal.tests}
              </p>
              <p className="text-green-800 text-sm">
                {t('aiPersonalization.focusSkill', 'Focus Skill')}: {studyPlan.weeklyGoal.focusSkill}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
            <p className="text-gray-800 font-medium">{studyPlan.motivationalMessage}</p>
          </div>
        </div>
      )}

      {/* AI Profile */}
      {personalization && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💪 {t('aiPersonalization.strengths', 'Your Strengths')}</h3>
            
            {personalization.aiProfile?.strengths?.length > 0 ? (
              <div className="space-y-3">
                {personalization.aiProfile.strengths.map((strength, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-900 capitalize">{strength.skill}</span>
                      <span className="text-green-600 font-bold">Band {strength.level}</span>
                    </div>
                    <p className="text-green-800 text-sm mt-1">{strength.reasoning}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">{t('aiPersonalization.noStrengths', 'No strengths identified yet. Keep practicing!')}</p>
            )}
          </div>

          {/* Weaknesses */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 {t('aiPersonalization.weaknesses', 'Areas to Improve')}</h3>
            
            {personalization.aiProfile?.weaknesses?.length > 0 ? (
              <div className="space-y-3">
                {personalization.aiProfile.weaknesses.map((weakness, index) => (
                  <div key={index} className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-orange-900 capitalize">{weakness.skill}</span>
                      <span className="text-orange-600 font-bold">Band {weakness.level}</span>
                    </div>
                    <p className="text-orange-800 text-sm mt-1">{weakness.reasoning}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        weakness.priority === 'high' ? 'bg-red-100 text-red-800' :
                        weakness.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {weakness.priority} priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">{t('aiPersonalization.noWeaknesses', 'No weaknesses identified yet. Great job!')}</p>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 {t('aiPersonalization.recommendations', 'AI Recommendations')}</h3>
          
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{recommendation.description}</p>
                    
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>⏱️ {recommendation.estimatedTime} {t('common.minutes', 'minutes')}</span>
                      <span>📚 {recommendation.skill}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                        recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {recommendation.priority} priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => updateRecommendationStatus(recommendation._id, 'completed')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      ✓ {t('common.complete', 'Complete')}
                    </button>
                    <button
                      onClick={() => updateRecommendationStatus(recommendation._id, 'skipped')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      ✗ {t('common.skip', 'Skip')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Analytics */}
      {analytics && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 {t('aiPersonalization.analytics', 'Learning Analytics')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{analytics.learningAnalytics?.totalStudyTime || 0}</div>
              <div className="text-gray-600 text-sm">{t('aiPersonalization.totalStudyTime', 'Total Study Time (minutes)')}</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{analytics.learningAnalytics?.predictedBandScore || 0}</div>
              <div className="text-gray-600 text-sm">{t('aiPersonalization.predictedBand', 'Predicted Band Score')}</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{Math.round((analytics.learningAnalytics?.confidenceLevel || 0) * 100)}%</div>
              <div className="text-gray-600 text-sm">{t('aiPersonalization.confidenceLevel', 'AI Confidence Level')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPersonalization;

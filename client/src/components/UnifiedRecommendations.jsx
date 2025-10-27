import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const UnifiedRecommendations = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [practiceRecommendations, setPracticeRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, ai, practice

  useEffect(() => {
    if (user) {
      fetchAllRecommendations();
    }
  }, [user]);

  const fetchAllRecommendations = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      // Fetch all types of recommendations in parallel
      const [aiRes, practiceRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/ai-recommendations/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/recommendations/practice`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setAiRecommendations(aiData.data || []);
      }

      if (practiceRes.ok) {
        const practiceData = await practiceRes.json();
        setPracticeRecommendations(practiceData.data || []);
      }

      // Combine all recommendations
      const allRecommendations = [
        ...(aiRes.ok ? (await aiRes.json()).data || [] : []),
        ...(practiceRes.ok ? (await practiceRes.json()).data || [] : [])
      ];
      setRecommendations(allRecommendations);

    } catch (error) {
      console.error('Fetch recommendations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRecommendations = () => {
    switch (activeTab) {
      case 'ai':
        return aiRecommendations;
      case 'practice':
        return practiceRecommendations;
      default:
        return recommendations;
    }
  };

  const getRecommendationIcon = (type) => {
    const icons = {
      ai: '🤖',
      practice: '💡',
      test: '📝',
      study: '📚',
      skill: '🎯'
    };
    return icons[type] || '💡';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || colors.medium;
  };

  const handleRecommendationAction = async (recommendationId, action) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/recommendations/${recommendationId}/action`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        // Refresh recommendations
        fetchAllRecommendations();
      }
    } catch (error) {
      console.error('Recommendation action error:', error);
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

  const filteredRecommendations = getFilteredRecommendations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">💡 {t('recommendations.title', 'Smart Recommendations')}</h2>
        <p className="text-purple-100">{t('recommendations.subtitle', 'Personalized suggestions to improve your IELTS score')}</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        {[
          { id: 'all', label: t('recommendations.all', 'All'), count: recommendations.length },
          { id: 'ai', label: t('recommendations.ai', 'AI Powered'), count: aiRecommendations.length },
          { id: 'practice', label: t('recommendations.practice', 'Practice'), count: practiceRecommendations.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {t('recommendations.noRecommendations', 'No recommendations yet')}
          </h3>
          <p className="text-gray-500">
            {t('recommendations.completeTests', 'Complete some tests to get personalized recommendations')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation, index) => (
            <div
              key={recommendation._id || index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">
                  {getRecommendationIcon(recommendation.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {recommendation.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {recommendation.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>⏱️ {recommendation.estimatedTime || 30} {t('common.minutes', 'minutes')}</span>
                      <span>📚 {recommendation.skill || 'General'}</span>
                      <span>🎯 {recommendation.difficulty || 'Medium'}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRecommendationAction(recommendation._id, 'start')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {t('common.start', 'Start')}
                      </button>
                      <button
                        onClick={() => handleRecommendationAction(recommendation._id, 'skip')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {t('common.skip', 'Skip')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnifiedRecommendations;

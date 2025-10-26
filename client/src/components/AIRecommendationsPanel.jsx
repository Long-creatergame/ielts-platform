import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AIRecommendationsPanel = ({ skill }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user && skill) {
      fetchRecommendations();
    }
  }, [user, skill]);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/ai-recommendations/my-recommendations?skill=${skill}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      
      // Get user's test results for this skill
      const testsResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/test-history`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const testsData = await testsResponse.json();
      const testResults = testsData.tests || [];

      // Generate new recommendations
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/ai-recommendations/generate-recommendations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            skill,
            testResults,
            currentLevel: user.currentBand || 6.0
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getSkillIcon = (skillName) => {
    switch (skillName?.toLowerCase()) {
      case 'reading': return '📖';
      case 'listening': return '🎧';
      case 'writing': return '✍️';
      case 'speaking': return '🎤';
      default: return '📚';
    }
  };

  const getSkillColor = (skillName) => {
    switch (skillName?.toLowerCase()) {
      case 'reading': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'listening': return 'bg-green-100 text-green-700 border-green-300';
      case 'writing': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'speaking': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getSkillIcon(skill)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              AI Recommendations
            </h3>
            <p className="text-sm text-gray-600">Personalized tips for {skill}</p>
          </div>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={generating}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            generating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {generating ? 'Generating...' : '🔄 Regenerate'}
        </button>
      </div>

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-gray-600 mb-4">No recommendations yet</p>
          <button
            onClick={generateRecommendations}
            disabled={generating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Recommendations
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${getSkillColor(skill)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{rec.icon || '💡'}</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">{rec.title || rec.tip}</h4>
                  {rec.description && (
                    <p className="text-sm opacity-90">{rec.description}</p>
                  )}
                  {rec.practice && (
                    <div className="mt-2 text-sm bg-white bg-opacity-50 rounded p-2">
                      <strong>Practice:</strong> {rec.practice}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note */}
      {recommendations.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          💡 <strong>Tip:</strong> These recommendations are personalized based on your recent test performance. 
          Focus on one area at a time for the best results.
        </div>
      )}
    </div>
  );
};

export default AIRecommendationsPanel;

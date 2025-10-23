import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RecommendedPractice = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('all');

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai-engine/recommend/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data.recommendations || []);
      }
    } catch (error) {
      console.error('Fetch recommendations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillIcon = (skill) => {
    switch (skill) {
      case 'writing': return '✍️';
      case 'speaking': return '🎤';
      case 'reading': return '📖';
      case 'listening': return '🎧';
      default: return '📚';
    }
  };

  const handleStartPractice = (recommendation) => {
    // TODO: Navigate to practice page
    alert(`Starting ${recommendation.title} practice...`);
  };

  const filteredRecommendations = selectedSkill === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === selectedSkill);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">💡 Recommended Practice</h2>
        <button
          onClick={fetchRecommendations}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Skill
        </label>
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Skills</option>
          <option value="writing">Writing</option>
          <option value="speaking">Speaking</option>
          <option value="reading">Reading</option>
          <option value="listening">Listening</option>
        </select>
      </div>

      {/* Recommendations */}
      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">💡</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Recommendations Yet</h3>
          <p className="text-gray-500 mb-4">
            Complete some AI assessments to get personalized practice recommendations.
          </p>
          <button
            onClick={() => {
              // TODO: Navigate to AI Practice
              alert('Go to AI Practice to generate questions!');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Generate Practice Questions
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getSkillIcon(recommendation.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {recommendation.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recommendation.difficulty)}`}>
                  {recommendation.difficulty}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>⏱️ {recommendation.estimatedTime}</span>
                  <span>📊 {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}</span>
                </div>
                <button
                  onClick={() => handleStartPractice(recommendation)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Start Practice
                </button>
              </div>

              {recommendation.focusAreas && recommendation.focusAreas.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm text-gray-600 font-medium">Focus Areas:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {recommendation.focusAreas.map((area, areaIndex) => (
                      <span
                        key={areaIndex}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => {
              // TODO: Navigate to AI Practice
              alert('AI Practice feature coming soon!');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Generate New Question
          </button>
          <button
            onClick={() => {
              // TODO: Navigate to weakness profile
              alert('Weakness profile feature coming soon!');
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            View My Weakness
          </button>
          <button
            onClick={fetchRecommendations}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Get New Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendedPractice;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AIRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [showFollowUp, setShowFollowUp] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchRecommendations();
  }, [selectedSkill]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/ai-recommendations/my-recommendations?skill=${selectedSkill}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

  const generateNewRecommendations = async (skill) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/ai-recommendations/generate-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skill,
          currentLevel: user?.currentLevel || 'B2'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(prev => [...prev, ...data.recommendations]);
        alert('New recommendations generated successfully!');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert('Failed to generate recommendations. Please try again.');
    }
  };

  const trackProgress = async (recommendationId, action, completed) => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch(`${API_BASE_URL}/api/ai-recommendations/track-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recommendationId,
          action,
          completed
        })
      });

      // Update local state
      setRecommendations(prev => 
        prev.map(rec => 
          rec._id === recommendationId 
            ? { ...rec, progress: { action, completed, updatedAt: new Date() } }
            : rec
        )
      );
    } catch (error) {
      console.error('Error tracking progress:', error);
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
      case 'reading': return '📖';
      case 'writing': return '✍️';
      case 'listening': return '👂';
      case 'speaking': return '🗣️';
      default: return '📚';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading recommendations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🎯 AI-Powered Skill Improvement
        </h2>
        <p className="text-gray-600 mb-6">
          Get personalized recommendations to improve your IELTS skills based on your test performance.
        </p>

        {/* Skill Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedSkill('all')}
            className={`px-4 py-2 rounded-full ${
              selectedSkill === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Skills
          </button>
          {['reading', 'writing', 'listening', 'speaking'].map(skill => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-4 py-2 rounded-full capitalize ${
                selectedSkill === skill 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {getSkillIcon(skill)} {skill}
            </button>
          ))}
        </div>

        {/* Generate New Recommendations */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Generate New Recommendations</h3>
          <div className="flex flex-wrap gap-2">
            {['reading', 'writing', 'listening', 'speaking'].map(skill => (
              <button
                key={skill}
                onClick={() => generateNewRecommendations(skill)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {getSkillIcon(skill)} Generate for {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No recommendations yet
            </h3>
            <p className="text-gray-500 mb-4">
              Complete some tests to get personalized AI recommendations!
            </p>
            <button
              onClick={() => generateNewRecommendations('writing')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Recommendations
            </button>
          </div>
        ) : (
          recommendations.map((recGroup, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 capitalize">
                  {getSkillIcon(recGroup.skill)} {recGroup.skill} Recommendations
                </h3>
                <span className="text-sm text-gray-500">
                  Generated: {new Date(recGroup.generatedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid gap-4">
                {recGroup.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {rec.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(rec.difficulty)}`}>
                        {rec.difficulty}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">
                      {rec.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-1">Action Required:</h5>
                        <p className="text-gray-600">{rec.action}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-1">Timeframe:</h5>
                        <p className="text-gray-600">{rec.timeframe}</p>
                      </div>
                    </div>

                    {rec.resources && rec.resources.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-700 mb-2">Resources:</h5>
                        <div className="flex flex-wrap gap-2">
                          {rec.resources.map((resource, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {resource}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-1">Expected Improvement:</h5>
                      <p className="text-green-600 font-medium">{rec.expectedImprovement}</p>
                    </div>

                    {/* Progress Tracking */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => trackProgress(rec.id, 'started', false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Mark as Started
                      </button>
                      <button
                        onClick={() => trackProgress(rec.id, 'completed', true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Mark as Completed
                      </button>
                      {rec.progress && (
                        <span className="text-sm text-gray-600">
                          Status: {rec.progress.completed ? '✅ Completed' : '🔄 In Progress'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Follow-up Recommendations */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowFollowUp(!showFollowUp)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {showFollowUp ? 'Hide' : 'Show'} Follow-up Recommendations
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;

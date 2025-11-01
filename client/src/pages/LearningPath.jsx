/**
 * Learning Path Page
 * Displays personalized AI-generated learning roadmap based on test results
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Loader from '../components/Loader';

export default function LearningPath() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [learningPath, setLearningPath] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLearningPath();
  }, [user]);

  const loadLearningPath = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/ai/learning-path`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLearningPath(data.learningPath);
      } else if (response.status === 404) {
        // No learning path yet
        setLearningPath(null);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to load learning path' }));
        setError(errorData.message);
      }
    } catch (err) {
      console.error('Error loading learning path:', err);
      setError('Failed to load learning path');
    } finally {
      setLoading(false);
    }
  };

  const generateLearningPath = async () => {
    try {
      setGenerating(true);
      setError(null);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/ai/learning-path`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLearningPath(data.learningPath);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate learning path' }));
        setError(errorData.message);
      }
    } catch (err) {
      console.error('Error generating learning path:', err);
      setError('Failed to generate learning path');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🗺️</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Learning Path</h2>
        <p className="text-gray-600 text-lg">Your personalized roadmap to IELTS success</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800">
          <p className="font-semibold">⚠️ Error</p>
          <p>{error}</p>
        </div>
      )}

      {!learningPath ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="text-center space-y-6">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
              <span className="text-6xl">🎯</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Learning Path Yet</h3>
              <p className="text-gray-600 mb-6">
                Complete at least one test to get your personalized learning path
              </p>
            </div>
            <button
              onClick={generateLearningPath}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {generating ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🚀</span>
                  <span>Generate My Learning Path</span>
                </div>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current vs Target */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-100 font-medium">Current Level</span>
                <span className="text-4xl">📊</span>
              </div>
              <div className="text-4xl font-bold mb-2">{learningPath.currentLevel}</div>
              <div className="text-blue-100">Band {learningPath.overallBand?.toFixed(1) || 'N/A'}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-100 font-medium">Target Level</span>
                <span className="text-4xl">🎯</span>
              </div>
              <div className="text-4xl font-bold mb-2">{learningPath.targetLevel}</div>
              <div className="text-green-100">Band {learningPath.targetBand?.toFixed(1) || 'N/A'}</div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">💪</span>
                Your Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {learningPath.strengths?.length > 0 ? (
                  learningPath.strengths.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-green-100 text-green-800 font-semibold px-4 py-2 rounded-xl"
                    >
                      {skill.charAt(0).toUpperCase() + skill.slice(1)}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600">No strengths identified yet</p>
                )}
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                Areas to Improve
              </h3>
              <div className="flex flex-wrap gap-2">
                {learningPath.weaknesses?.length > 0 ? (
                  learningPath.weaknesses.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-orange-100 text-orange-800 font-semibold px-4 py-2 rounded-xl"
                    >
                      {skill.charAt(0).toUpperCase() + skill.slice(1)}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600">No weaknesses identified yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Study Plan */}
          {learningPath.studyPlan && (
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">📅</span>
                Recommended Study Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="text-sm text-gray-600 mb-1">Daily</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {learningPath.studyPlan.dailyMinutes} min
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">📚</div>
                  <div className="text-sm text-gray-600 mb-1">Weekly</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {learningPath.studyPlan.weeklySessions} sessions
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-sm text-gray-600 mb-1">Focus Areas</div>
                  <div className="text-lg font-semibold text-green-600">
                    {learningPath.studyPlan.focusAreas?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              Recommended Next Steps
            </h3>
            <div className="space-y-4">
              {learningPath.recommendations?.length > 0 ? (
                learningPath.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-lg text-sm">
                            {rec.skill?.charAt(0).toUpperCase() + rec.skill?.slice(1)}
                          </span>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                            rec.priority === 'high' 
                              ? 'bg-red-100 text-red-800'
                              : rec.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rec.priority?.toUpperCase()}
                          </span>
                          {rec.estimatedTime && (
                            <span className="text-gray-600 text-sm">
                              ⏱️ {rec.estimatedTime} min
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {rec.taskType || 'Practice Exercise'}
                        </h4>
                        <p className="text-gray-700">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No recommendations available yet
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={generateLearningPath}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {generating ? 'Generating...' : '🔄 Regenerate Path'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

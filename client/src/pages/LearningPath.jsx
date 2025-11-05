/**
 * Learning Path Page
 * Displays personalized AI-generated learning roadmap with visualizations
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Loader from '../components/Loader';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { formatLocalTime, formatRelativeTime } from '../utils/dateFormat';
import { getUserTimezone } from '../utils/timezone';

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

      // Fetch both learning path and user results in parallel
      const [pathResponse, resultsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/ai/learning-path`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => null),
        fetch(`${API_BASE_URL}/api/user-results`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => null)
      ]);

      // Handle learning path response
      if (pathResponse && pathResponse.ok) {
        const data = await pathResponse.json();
        setLearningPath(data.learningPath);
      } else if (pathResponse && pathResponse.status === 404) {
        setLearningPath(null);
      } else if (pathResponse) {
        const errorData = await pathResponse.json().catch(() => ({ message: 'Failed to load learning path' }));
        setError(errorData.message);
      }

      // Handle user results response (fallback if no learning path)
      if (resultsResponse && resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        if (resultsData.success && resultsData.data && !learningPath) {
          // Create a basic learning path from results
          setLearningPath({
            skillBands: resultsData.data,
            recommendations: [],
            generatedAt: new Date().toISOString(),
            localGeneratedAt: formatLocalTime(new Date().toISOString())
          });
        }
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

  // Prepare radar chart data
  const getRadarData = () => {
    if (!learningPath?.skillBands) return null;
    
    return [
      { skill: 'Reading', score: learningPath.skillBands.reading || 0, fullMark: 9 },
      { skill: 'Listening', score: learningPath.skillBands.listening || 0, fullMark: 9 },
      { skill: 'Writing', score: learningPath.skillBands.writing || 0, fullMark: 9 },
      { skill: 'Speaking', score: learningPath.skillBands.speaking || 0, fullMark: 9 }
    ];
  };

  const getSkillColor = (skill, bands) => {
    if (!bands || !bands[skill]) return '#94a3b8'; // gray
    
    const score = bands[skill];
    if (score < 5) return '#EF476F'; // red for weak
    if (score < 7) return '#FFD166'; // yellow for medium
    return '#35b86d'; // green for strong
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🗺️</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Learning Path</h2>
        <p className="text-gray-600 text-lg">Your personalized roadmap to IELTS success</p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800"
        >
          <p className="font-semibold">⚠️ Error</p>
          <p>{error}</p>
        </motion.div>
      )}

      {/* Empty State */}
      {!learningPath ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8"
        >
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
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Current vs Target */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
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
          </motion.div>

          {/* Radar Chart */}
          {getRadarData() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-2">📈</span>
                Skills Overview
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData()}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="skill" 
                      tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 600 }}
                      style={{ textTransform: 'capitalize' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 9]}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Radar
                      name="Band Score"
                      dataKey="score"
                      stroke="#35b86d"
                      fill="#35b86d"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Skill Progress Bars */}
          {learningPath.skillBands && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Skill Performance Breakdown
              </h3>
              <div className="space-y-4">
                {Object.entries(learningPath.skillBands).map(([skill, band]) => {
                  const skillCapitalized = skill.charAt(0).toUpperCase() + skill.slice(1);
                  const percentage = (band / 9) * 100;
                  const color = getSkillColor(skill, learningPath.skillBands);
                  const isWeak = learningPath.weaknesses?.includes(skill);
                  
                  return (
                    <div key={skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">{skillCapitalized}</span>
                        <div className="flex items-center space-x-2">
                          {isWeak && (
                            <span className="text-xs text-red-600 font-bold">🔴 Needs Focus</span>
                          )}
                          <span className="text-lg font-bold" style={{ color }}>{band?.toFixed(1)} / 9.0</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1.5, delay: 0.5 + (Object.keys(learningPath.skillBands).indexOf(skill) * 0.1) }}
                          className="h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Strengths & Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">💪</span>
                Your Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {learningPath.strengths?.length > 0 ? (
                  learningPath.strengths.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="bg-green-100 text-green-800 font-semibold px-4 py-2 rounded-xl"
                    >
                      {skill.charAt(0).toUpperCase() + skill.slice(1)}
                    </motion.span>
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
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="bg-red-100 text-red-800 font-semibold px-4 py-2 rounded-xl"
                    >
                      {skill.charAt(0).toUpperCase() + skill.slice(1)}
                    </motion.span>
                  ))
                ) : (
                  <p className="text-gray-600">No weaknesses identified yet</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Study Plan */}
          {learningPath.studyPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">📅</span>
                Recommended Study Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center"
                >
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="text-sm text-gray-600 mb-1">Daily</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {learningPath.studyPlan.dailyMinutes} min
                  </div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center"
                >
                  <div className="text-3xl mb-2">📚</div>
                  <div className="text-sm text-gray-600 mb-1">Weekly</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {learningPath.studyPlan.weeklySessions} sessions
                  </div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center"
                >
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-sm text-gray-600 mb-1">Focus Areas</div>
                  <div className="text-lg font-semibold text-green-600">
                    {learningPath.studyPlan.focusAreas?.length || 0}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              Recommended Next Steps
            </h3>
            <div className="space-y-4">
              {learningPath.recommendations?.length > 0 ? (
                learningPath.recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
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
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No recommendations available yet
                </p>
              )}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center space-x-4"
          >
            <button
              onClick={generateLearningPath}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {generating ? 'Generating...' : '🔄 Regenerate Path'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
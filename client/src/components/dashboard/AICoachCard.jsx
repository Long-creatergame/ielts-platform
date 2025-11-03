/**
 * AI Coach Card Component
 * Displays personalized AI learning summary and recommendations
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AICoachCard = ({ userId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/api/ai/summary/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        
        if (result.success && result.data) {
          setSummary(result.data);
        } else {
          setError(result.message || 'Unable to fetch AI summary');
        }
      } catch (err) {
        console.error('[AICoachCard] Fetch error:', err);
        setError('Failed to load AI insights');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSummary();
    }
  }, [userId, API_BASE_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-8 border border-indigo-100"
      >
        <h3 className="text-xl font-semibold text-indigo-700 mb-3">
          🤖 AI Learning Coach
        </h3>
        <p className="text-gray-600 text-center">
          {error || 'Complete Writing or Speaking tests to receive personalized AI insights.'}
        </p>
      </motion.div>
    );
  }

  const getStrengthColor = (score) => {
    if (score >= 7.5) return 'text-green-600';
    if (score >= 6.5) return 'text-blue-600';
    if (score >= 5.5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getWeaknessColor = (score) => {
    if (score >= 7.0) return 'text-green-600';
    if (score >= 6.0) return 'text-blue-600';
    if (score >= 5.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">
            🎯 AI Learning Coach
          </h2>
          <span className="text-sm text-white/80">
            {summary.feedbackCount} {summary.feedbackCount === 1 ? 'test' : 'tests'} analyzed
          </span>
        </div>
        <p className="text-white/90 text-sm">
          Personalized insights based on your performance
        </p>
      </div>

      {/* Summary Message */}
      <div className="bg-white/10 backdrop-blur-sm px-6 py-4 border-t border-white/20">
        <p className="text-white text-base leading-relaxed">
          {summary.aiSummary}
        </p>
      </div>

      {/* Recommendation Panel */}
      <div className="bg-white rounded-t-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">
            📌 Focus Area
          </h3>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-l-4 border-red-500">
            <p className="text-lg font-bold text-gray-900 mb-1">
              {summary.recommendation.focusSkill}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              💡 {summary.recommendation.suggestedPractice}
            </p>
          </div>
        </div>

        {/* Skill Comparison */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600 mb-1">Strongest</p>
            <p className={`text-2xl font-bold ${getStrengthColor(summary.strongestScore)}`}>
              {summary.strongestSkill}
            </p>
            <p className="text-xs text-gray-500">
              {summary.strongestScore.toFixed(1)}/9
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600 mb-1">Needs Work</p>
            <p className={`text-2xl font-bold ${getWeaknessColor(summary.weakestScore)}`}>
              {summary.weakestSkill}
            </p>
            <p className="text-xs text-gray-500">
              {summary.weakestScore.toFixed(1)}/9
            </p>
          </div>
        </div>

        {/* Mini Progress Indicator */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-600 font-medium">Overall Progress</span>
            <span className="text-gray-900 font-bold">
              {summary.strongestScore.toFixed(1)} avg
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(summary.strongestScore / 9) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AICoachCard;


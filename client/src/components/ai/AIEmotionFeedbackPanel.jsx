/**
 * AI Emotion Feedback Panel Component
 * Displays emotion detection and AI feedback with Cambridge mentor tone
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const AIEmotionFeedbackPanel = ({ performance, onFeedbackReceived }) => {
  const { user } = useAuth();
  const [emotionData, setEmotionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (performance) {
      fetchEmotionFeedback();
    }
  }, [performance]);

  const fetchEmotionFeedback = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

      const response = await fetch(`${API_BASE_URL}/api/ai/emotion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          performance: performance
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setEmotionData(result.data);
          
          // Trigger callback if provided
          if (onFeedbackReceived) {
            onFeedbackReceived(result.data);
          }
        }
      } else {
        throw new Error('Failed to fetch emotion feedback');
      }
    } catch (err) {
      console.error('Error fetching emotion feedback:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      frustrated: 'bg-red-50 border-red-200 text-red-800',
      discouraged: 'bg-orange-50 border-orange-200 text-orange-800',
      disengaged: 'bg-gray-50 border-gray-200 text-gray-800',
      confident: 'bg-green-50 border-green-200 text-green-800',
      motivated: 'bg-blue-50 border-blue-200 text-blue-800',
      persevering: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      steady: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      stagnant: 'bg-gray-50 border-gray-200 text-gray-800',
      neutral: 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return colors[emotion] || colors.neutral;
  };

  const getToneColor = (tone) => {
    const colors = {
      supportive: 'text-red-600',
      uplifting: 'text-orange-600',
      motivating: 'text-blue-600',
      professional: 'text-green-600',
      energetic: 'text-purple-600',
      encouraging: 'text-yellow-600',
      balanced: 'text-gray-600'
    };
    return colors[tone] || colors.balanced;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-sm text-gray-600">Analyzing your progress...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-sm text-red-800">Unable to load emotion feedback. Please try again.</p>
      </div>
    );
  }

  if (!emotionData) {
    return null;
  }

  const { emotion, emotionMeta, tone, message, engagement } = emotionData;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-xl border-2 border-indigo-200 p-6 mb-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🧠</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Coach Insight</h3>
              <p className="text-xs text-gray-600">Emotional intelligence feedback</p>
            </div>
          </div>
        </div>

        {/* Emotion Detection */}
        <div className={`mb-4 p-4 rounded-xl border-2 ${getEmotionColor(emotion)}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{emotionMeta.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">Emotion Detected: {emotionMeta.label}</p>
              <p className="text-xs opacity-80">{emotionMeta.description}</p>
            </div>
          </div>
        </div>

        {/* AI Message */}
        <div className="bg-white/80 rounded-xl p-5 border-2 border-indigo-300 mb-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💬</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-2">Cambridge AI Coach</p>
              <p className="text-base text-gray-800 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        {/* Tone Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Tone:</span>
            <span className={`text-sm font-medium capitalize ${getToneColor(tone.type)}`}>
              {tone.type}
            </span>
            <span className="text-xs text-gray-500">({tone.style})</span>
          </div>
        </div>

        {/* Engagement Metrics */}
        {engagement && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Motivation</p>
              <p className="text-lg font-bold text-indigo-600">
                {engagement.motivationScore}/10
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Sentiment</p>
              <p className="text-lg font-bold capitalize text-gray-800">
                {engagement.sentimentTrend}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Trend</p>
              <p className="text-lg font-bold capitalize text-gray-800">
                {engagement.improvementTrend === 'upward' ? '📈' : engagement.improvementTrend === 'downward' ? '📉' : '➡️'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Sessions</p>
              <p className="text-lg font-bold text-gray-800">
                {engagement.totalSessions}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={fetchEmotionFeedback}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
          >
            Refresh Feedback
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIEmotionFeedbackPanel;

/**
 * Motivation Panel Component
 * Displays AI-generated motivation messages, streaks, and achievements
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const MotivationPanel = ({ userId }) => {
  const [motivationData, setMotivationData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMotivationData();
  }, [userId]);

  const loadMotivationData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');

      // Fetch latest message and summary in parallel
      const [messageRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/motivation/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/motivation/summary/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (messageRes.ok) {
        const messageData = await messageRes.json();
        setMotivationData(messageData.data);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.data);
      }
    } catch (error) {
      console.error('Error loading motivation data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!motivationData && !summary) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Latest Motivation Message */}
      {motivationData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500"
        >
          <div className="flex items-start space-x-3">
            <span className="text-3xl">
              {motivationData.mood === 'celebrating' ? '🎉' :
               motivationData.mood === 'positive' ? '🌟' :
               motivationData.mood === 'motivating' ? '🔥' :
               motivationData.mood === 'supportive' ? '💪' : '💡'}
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {motivationData.title}
              </h3>
              <p className="text-gray-700 mb-3 leading-relaxed">
                {motivationData.text}
              </p>
              {motivationData.suggestion && (
                <div className="bg-white/70 rounded-lg p-3 border border-indigo-200">
                  <p className="text-sm text-indigo-700 font-medium">
                    💡 <strong>Suggested:</strong> {motivationData.suggestion}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Streak & Achievements Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">🔥</span>
              <h4 className="text-lg font-bold text-gray-900">Current Streak</h4>
            </div>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-orange-600 mb-2">
                {summary.streakDays}
              </div>
              <p className="text-gray-600 text-sm">
                {summary.streakDays === 1 ? 'day' : 'days'} in a row
              </p>
              {summary.longestStreak > summary.streakDays && (
                <p className="text-gray-500 text-xs mt-2">
                  Best: {summary.longestStreak} days
                </p>
              )}
            </div>
          </motion.div>

          {/* Recent Achievements */}
          {summary.achievements && summary.achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">⭐</span>
                <h4 className="text-lg font-bold text-gray-900">Recent Achievements</h4>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {summary.achievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{achievement.badge || '🏆'}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {achievement.title}
                        </p>
                        {achievement.date && (
                          <p className="text-xs text-gray-500">
                            {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default MotivationPanel;


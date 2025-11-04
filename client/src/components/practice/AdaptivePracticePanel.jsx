/**
 * Adaptive Practice Panel Component
 * Displays real-time adaptive practice interface with AI feedback
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdaptivePracticePanel = ({ skill, mode = 'academic', onPracticeComplete }) => {
  const { user } = useAuth();
  const [currentBand, setCurrentBand] = useState(5.5);
  const [hint, setHint] = useState('');
  const [streakMessage, setStreakMessage] = useState('');
  const [nextTask, setNextTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [streak, setStreak] = useState(0);

  // Load session data on mount
  useEffect(() => {
    loadSessionData();
  }, [skill, mode]);

  const loadSessionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      
      const response = await fetch(
        `${API_BASE_URL}/api/practice/session/${skill}?mode=${mode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.exists) {
          setCurrentBand(result.data.currentBand);
          setAccuracy(result.data.accuracy);
          setStreak(result.data.streak);
          setHint(result.data.lastHint || '');
          setSessionData(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  };

  const submitPracticeResult = async (correct, total, commonMistakes = []) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

      const response = await fetch(`${API_BASE_URL}/api/practice/adaptive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skill,
          mode,
          performance: {
            correct,
            total,
            commonMistakes
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data;
          
          // Update state with new data
          setCurrentBand(data.session.currentBand);
          setAccuracy(data.session.accuracy);
          setStreak(data.session.streak);
          setHint(data.hint);
          setStreakMessage(data.streakMessage);
          setNextTask(data.nextTask);
          setProgress(data.progress);
          setSessionData(data.session);

          // Trigger completion callback if provided
          if (onPracticeComplete) {
            onPracticeComplete(data);
          }
        }
      } else {
        console.error('Failed to submit practice result');
      }
    } catch (error) {
      console.error('Error submitting practice result:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBandColor = (band) => {
    if (band >= 8.0) return 'text-purple-600';
    if (band >= 7.0) return 'text-blue-600';
    if (band >= 6.0) return 'text-green-600';
    if (band >= 5.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressIcon = (direction) => {
    if (direction === 'up') return '📈';
    if (direction === 'down') return '📉';
    return '➡️';
  };

  const getSkillIcon = (skillName) => {
    const icons = {
      reading: '📖',
      listening: '🎧',
      writing: '✍️',
      speaking: '🎤'
    };
    return icons[skillName] || '📚';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-xl border-2 border-indigo-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
            {getSkillIcon(skill)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Adaptive Practice</h2>
            <p className="text-sm text-gray-600 capitalize">
              {skill} • {mode === 'academic' ? 'Academic' : 'General Training'}
            </p>
          </div>
        </div>
        <div className={`text-3xl font-bold ${getBandColor(currentBand)}`}>
          {currentBand.toFixed(1)}
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-1">Current Band</p>
          <p className={`text-2xl font-bold ${getBandColor(currentBand)}`}>
            {currentBand.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {sessionData?.difficultyLabel || 'Intermediate'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-1">Accuracy</p>
          <p className="text-2xl font-bold text-green-600">
            {accuracy.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {sessionData?.totalQuestions || 0} questions
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-1">Streak</p>
          <p className="text-2xl font-bold text-orange-600">
            {streak}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {streakMessage || 'Keep going!'}
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      {progress && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 p-3 rounded-lg ${
              progress.direction === 'up' 
                ? 'bg-green-100 border border-green-300' 
                : progress.direction === 'down'
                ? 'bg-yellow-100 border border-yellow-300'
                : 'bg-blue-100 border border-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{getProgressIcon(progress.direction)}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  Difficulty {progress.direction === 'up' ? 'Increased' : progress.direction === 'down' ? 'Decreased' : 'Maintained'}
                </p>
                <p className="text-xs text-gray-600">
                  {progress.previousDifficulty.toFixed(1)} → {progress.newDifficulty.toFixed(1)}
                  {progress.change !== 0 && ` (${progress.change > 0 ? '+' : ''}${progress.change.toFixed(1)})`}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* AI Hint */}
      {hint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 rounded-xl p-4 border-2 border-indigo-300 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">AI Suggestion</p>
              <p className="text-sm text-gray-600">{hint}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Task Suggestion */}
      {nextTask && (
        <div className="bg-white/80 rounded-xl p-4 border border-indigo-200 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📚</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-2">Next Recommended Task</p>
              <p className="text-xs text-gray-600 mb-2">{nextTask.description}</p>
              {nextTask.recommendedTypes && nextTask.recommendedTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {nextTask.recommendedTypes.map((type, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-sm text-gray-600">Processing...</span>
        </div>
      )}

      {/* Practice Action Button (for demo purposes) */}
      <div className="mt-6 p-4 bg-white/50 rounded-xl border border-gray-200">
        <p className="text-xs text-gray-600 mb-2 text-center">
          💡 Submit your practice results to get adaptive feedback
        </p>
        <p className="text-xs text-gray-500 text-center italic">
          Call submitPracticeResult(correct, total) from your practice component
        </p>
      </div>
    </div>
  );
};

// Export helper function for external use
export const useAdaptivePractice = () => {
  const submitPracticeResult = async (skill, mode, correct, total, commonMistakes = []) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

      const response = await fetch(`${API_BASE_URL}/api/practice/adaptive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skill,
          mode,
          performance: {
            correct,
            total,
            commonMistakes
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.success ? result.data : null;
      }
      return null;
    } catch (error) {
      console.error('Error submitting practice result:', error);
      return null;
    }
  };

  return { submitPracticeResult };
};

export default AdaptivePracticePanel;

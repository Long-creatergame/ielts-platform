/**
 * Learning Path Panel Component
 * Displays AI-generated learning recommendations
 */

import React from 'react';
import { motion } from 'framer-motion';

const LearningPathPanel = ({ path }) => {
  if (!path || !path.targetSkill) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-indigo-600 mb-4">🎯 Next Focus</h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <p className="text-sm text-center">
            Complete more tests to receive AI-generated learning recommendations.
          </p>
        </div>
      </motion.div>
    );
  }

  const getSkillEmoji = (skill) => {
    const emojiMap = {
      reading: '📖',
      listening: '🎧',
      writing: '✍️',
      speaking: '🎤'
    };
    return emojiMap[skill.toLowerCase()] || '📊';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Recently';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-indigo-100"
    >
      <h3 className="text-lg md:text-xl font-semibold text-indigo-700 mb-4">
        🎯 AI Learning Focus
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{getSkillEmoji(path.targetSkill)}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 uppercase mb-1">Target Skill</p>
            <p className="text-lg font-bold text-gray-900 capitalize">{path.targetSkill}</p>
          </div>
        </div>

        {path.nextFocus && (
          <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
            <p className="text-sm font-medium text-gray-600 mb-1">Focus Area</p>
            <p className="text-gray-900 leading-relaxed">{path.nextFocus}</p>
          </div>
        )}

        {path.aiReason && (
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              💬 {path.aiReason}
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-indigo-200">
          <p className="text-xs text-gray-500">
            Last updated: {formatDate(path.lastUpdated)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningPathPanel;


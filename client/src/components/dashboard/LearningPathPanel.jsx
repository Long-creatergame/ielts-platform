/**
 * Learning Path Panel Component
 * Displays AI-generated learning recommendations
 */

import React from 'react';
import { motion } from 'framer-motion';

const LearningPathPanel = ({ path, weakSkills = [], recommendations = [] }) => {
  // Use path if provided, otherwise use props directly
  const targetSkill = path?.targetSkill || (weakSkills.length > 0 ? weakSkills[0] : null);
  const pathRecommendations = path?.recommendations || recommendations;
  
  if (!path && !targetSkill && weakSkills.length === 0) {
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
          <span className="text-2xl">{getSkillEmoji(targetSkill)}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 uppercase mb-1">Target Skill</p>
            <p className="text-lg font-bold text-gray-900 capitalize">{targetSkill}</p>
          </div>
        </div>
        
        {weakSkills.length > 0 && (
          <div className="mt-3 bg-white rounded-lg p-3 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-600 mb-2">Weak Skills to Focus</p>
            <div className="flex flex-wrap gap-2">
              {weakSkills.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium capitalize">
                  {getSkillEmoji(skill)} {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {pathRecommendations.length > 0 && (
          <div className="mt-3 bg-white rounded-lg p-3 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600 mb-2">AI Recommendations</p>
            <ul className="space-y-1">
              {pathRecommendations.slice(0, 3).map((rec, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  • {typeof rec === 'string' ? rec : rec.description || rec.taskType || rec.skill}
                </li>
              ))}
            </ul>
          </div>
        )}

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


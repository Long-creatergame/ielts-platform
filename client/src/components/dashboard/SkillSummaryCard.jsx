/**
 * Skill Summary Card Component
 * Displays average band and trend for a single skill
 */

import React from 'react';
import { motion } from 'framer-motion';

const SkillSummaryCard = ({ skill, avg = 0, trend = 0 }) => {
  const getEmoji = (s) => {
    const emojiMap = {
      reading: '📖',
      listening: '🎧',
      writing: '✍️',
      speaking: '🎤'
    };
    return emojiMap[s.toLowerCase()] || '📊';
  };

  const getColor = () => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getTrendIcon = () => {
    if (trend > 0) return '▲';
    if (trend < 0) return '▼';
    return '▬';
  };

  const getTrendText = () => {
    if (trend > 0) return `+${trend.toFixed(1)} improving`;
    if (trend < 0) return `${trend.toFixed(1)} decrease`;
    return 'stable';
  };

  const skillName = skill.charAt(0).toUpperCase() + skill.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{getEmoji(skill)}</span>
          <span className="text-xs font-medium text-gray-500 uppercase">{skillName}</span>
        </div>
        <p className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2">
          {avg > 0 ? avg.toFixed(1) : '—'}
        </p>
      </div>
      <p className={`text-sm font-medium ${getColor()}`}>
        <span className="mr-1">{getTrendIcon()}</span>
        {getTrendText()}
      </p>
    </motion.div>
  );
};

export default SkillSummaryCard;


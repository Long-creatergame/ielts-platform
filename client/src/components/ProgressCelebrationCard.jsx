/**
 * Progress Celebration Card
 * Celebrates user achievements and motivates continued learning
 */

import React from 'react';
import { motion } from 'framer-motion';

const ProgressCelebrationCard = ({ improvement, skill, currentBand, previousBand }) => {
  // Determine celebration level
  const getCelebrationData = () => {
    if (improvement >= 1.0) {
      return {
        icon: '🎉',
        title: 'MAJOR BREAKTHROUGH!',
        message: `Wow! You just improved by ${improvement.toFixed(1)} bands in ${skill}!`,
        subMessage: 'Cambridge would be impressed by this progress.',
        gradient: 'from-purple-500 via-pink-500 to-orange-500',
        bgColor: 'bg-gradient-to-r from-purple-100 to-pink-100',
        borderColor: 'border-purple-500'
      };
    } else if (improvement >= 0.5) {
      return {
        icon: '🌟',
        title: 'EXCELLENT PROGRESS!',
        message: `You've improved by ${improvement.toFixed(1)} bands in ${skill}!`,
        subMessage: 'Your dedication is showing real results.',
        gradient: 'from-green-500 to-emerald-600',
        bgColor: 'bg-gradient-to-r from-green-100 to-emerald-100',
        borderColor: 'border-green-500'
      };
    } else if (currentBand >= 7.5) {
      return {
        icon: '🏆',
        title: 'OUTSTANDING!',
        message: `You're achieving excellence-level scores!`,
        subMessage: 'Band 7.5+ is professional territory. Exceptional!',
        gradient: 'from-blue-500 via-purple-500 to-indigo-600',
        bgColor: 'bg-gradient-to-r from-blue-100 to-purple-100',
        borderColor: 'border-blue-500'
      };
    } else if (improvement > 0) {
      return {
        icon: '👏',
        title: 'KEEP GOING!',
        message: `You improved by ${improvement.toFixed(1)} bands!`,
        subMessage: 'Every step forward counts. You\'re on track!',
        gradient: 'from-indigo-500 to-blue-600',
        bgColor: 'bg-gradient-to-r from-indigo-100 to-blue-100',
        borderColor: 'border-indigo-500'
      };
    }
    return null;
  };

  const celebration = getCelebrationData();

  if (!celebration) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6, type: "spring" }}
      className={`rounded-2xl shadow-2xl overflow-hidden border-4 ${celebration.borderColor} mb-6`}
    >
      <div className={`bg-gradient-to-br ${celebration.gradient} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-6xl">{celebration.icon}</span>
          <div className="text-right">
            <p className="text-sm opacity-90">Previous: {previousBand.toFixed(1)}</p>
            <p className="text-3xl font-bold">→ {currentBand.toFixed(1)}</p>
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2">{celebration.title}</h3>
        <p className="text-lg">{celebration.message}</p>
      </div>
      
      <div className={`${celebration.bgColor} p-4 border-t-2 ${celebration.borderColor}`}>
        <p className="text-sm text-gray-700 font-medium italic text-center">
          {celebration.subMessage}
        </p>
      </div>
    </motion.div>
  );
};

export default ProgressCelebrationCard;


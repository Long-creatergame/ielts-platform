/**
 * Band Breakdown Card Component
 * Displays sub-scores for different IELTS criteria
 */

import React from 'react';
import { motion } from 'framer-motion';

const BandBreakdownCard = ({ bands = {}, targetBand = 6.5 }) => {
  const isEmpty = !bands || Object.keys(bands).length === 0;

  if (isEmpty) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-indigo-100">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4">
          🎯 Band Breakdown
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <p className="text-sm text-center">No band data available</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= targetBand + 0.5) return 'bg-green-500';
    if (score >= targetBand) return 'bg-blue-500';
    if (score >= targetBand - 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= targetBand + 0.5) return 'Above target';
    if (score >= targetBand) return 'At target';
    if (score >= targetBand - 0.5) return 'Below target';
    return 'Needs work';
  };

  const getBandIcon = (criteria) => {
    const icons = {
      grammar: '📖',
      vocabulary: '📚',
      coherence: '🔗',
      task: '🎯',
      fluency: '💬',
      pronunciation: '🎤',
      lexical: '📚',
      cohesion: '🔗'
    };
    
    const criteriaLower = criteria.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (criteriaLower.includes(key)) return icon;
    }
    return '📊';
  };

  // Calculate overall average
  const overallScore = Object.values(bands).reduce((sum, score) => sum + parseFloat(score || 0), 0) / Object.values(bands).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-indigo-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-indigo-700">
          🎯 Band Breakdown
        </h3>
        <div className="text-right">
          <p className="text-xs text-gray-600">Overall</p>
          <p className="text-2xl font-bold text-indigo-700">
            {overallScore.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(bands).map(([criteria, score], index) => {
          const numericScore = parseFloat(score || 0);
          const percentage = (numericScore / 9) * 100;
          const displayCriteria = criteria.charAt(0).toUpperCase() + criteria.slice(1).replace(/([A-Z])/g, ' $1');

          return (
            <motion.div
              key={criteria}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Criteria Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getBandIcon(criteria)}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {displayCriteria}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {numericScore.toFixed(1)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getScoreColor(numericScore)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-600">
                  {getScoreLabel(numericScore)}
                </span>
                <span className="text-xs font-medium text-gray-700">
                  Target: {targetBand}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">Target Band</p>
            <p className="text-lg font-bold text-indigo-700">{targetBand}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Your Average</p>
            <p className={`text-lg font-bold ${
              overallScore >= targetBand ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {overallScore.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BandBreakdownCard;


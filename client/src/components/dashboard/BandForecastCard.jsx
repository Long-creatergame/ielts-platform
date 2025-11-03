/**
 * Band Forecast Card Component
 * Projects future band score based on recent performance
 */

import React from 'react';
import { motion } from 'framer-motion';

const BandForecastCard = ({ bandProgress }) => {
  // Calculate averages
  const calculateAverage = (arr) => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + (val || 0), 0) / arr.length;
  };

  const averages = {
    reading: calculateAverage(bandProgress?.reading || []),
    listening: calculateAverage(bandProgress?.listening || []),
    writing: calculateAverage(bandProgress?.writing || []),
    speaking: calculateAverage(bandProgress?.speaking || [])
  };

  const currentAverage = Object.values(averages).reduce((sum, val) => sum + val, 0) / 4;
  
  // Calculate trend from last 3 tests vs previous 3 tests
  const getTrend = (arr) => {
    if (!arr || arr.length < 6) return 0;
    const recent3 = arr.slice(-3);
    const previous3 = arr.slice(-6, -3);
    const recentAvg = recent3.reduce((sum, val) => sum + val, 0) / 3;
    const previousAvg = previous3.reduce((sum, val) => sum + val, 0) / 3;
    return recentAvg - previousAvg;
  };

  const overallTrend = getTrend([
    ...(bandProgress?.reading || []).slice(-1),
    ...(bandProgress?.listening || []).slice(-1),
    ...(bandProgress?.writing || []).slice(-1),
    ...(bandProgress?.speaking || []).slice(-1)
  ]);

  const projectedBand = Math.min(9, Math.max(3, (currentAverage + (overallTrend * 0.3)).toFixed(1)));

  const isEmpty = currentAverage === 0;

  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-indigo-100"
      >
        <h3 className="text-lg md:text-xl font-semibold text-indigo-700 mb-4">
          📈 Band Forecast
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <p className="text-sm text-center">Complete tests to see forecast</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-indigo-100"
    >
      <h3 className="text-lg md:text-xl font-semibold text-indigo-700 mb-4 text-center">
        📈 Band Forecast
      </h3>
      
      <div className="space-y-4 text-center">
        <div>
          <p className="text-sm text-gray-600 mb-1">Current Average</p>
          <p className="text-3xl md:text-4xl font-bold text-indigo-700">
            {currentAverage.toFixed(1)}
          </p>
        </div>

        <div className="border-t border-indigo-200 pt-4">
          <p className="text-sm text-gray-600 mb-1">Projected (next 3 tests)</p>
          <p className={`text-3xl md:text-4xl font-bold ${
            overallTrend > 0 ? 'text-green-600' : overallTrend < 0 ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {projectedBand}
          </p>
        </div>

        <div className="pt-2">
          <p className="text-xs text-gray-500">
            {overallTrend > 0 ? '📈 Improving trend' : overallTrend < 0 ? '📉 Decreasing trend' : '▬ Stable performance'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BandForecastCard;


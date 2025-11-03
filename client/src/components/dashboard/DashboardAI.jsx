/**
 * Dashboard AI Analytics Component
 * Main layout for AI-powered learning analytics
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BandChart from './BandChart';
import SkillSummaryCard from './SkillSummaryCard';
import LearningPathPanel from './LearningPathPanel';
import BandForecastCard from './BandForecastCard';

const DashboardAI = ({ user, isLoading = false }) => {
  const [displayData, setDisplayData] = useState({
    bandProgress: {},
    learningPath: {},
    averages: {},
    trends: {},
    chartData: []
  });

  useEffect(() => {
    if (!user || !user.bandProgress) {
      setDisplayData({
        bandProgress: {},
        learningPath: user?.learningPath || {},
        averages: {},
        trends: {},
        chartData: []
      });
      return;
    }

    const { bandProgress, learningPath } = user;

    // Calculate averages
    const calculateAverage = (arr) => {
      if (!arr || arr.length === 0) return 0;
      return arr.reduce((sum, val) => sum + (val || 0), 0) / arr.length;
    };

    const averages = {
      reading: calculateAverage(bandProgress.reading),
      listening: calculateAverage(bandProgress.listening),
      writing: calculateAverage(bandProgress.writing),
      speaking: calculateAverage(bandProgress.speaking)
    };

    // Calculate trends (comparison between last test and average of previous 3)
    const calculateTrend = (arr) => {
      if (!arr || arr.length === 0) return 0;
      if (arr.length === 1) return arr[0];
      
      const recent = arr[arr.length - 1];
      const previous = arr.slice(0, -1);
      const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
      return recent - previousAvg;
    };

    const trends = {
      reading: calculateTrend(bandProgress.reading || []),
      listening: calculateTrend(bandProgress.listening || []),
      writing: calculateTrend(bandProgress.writing || []),
      speaking: calculateTrend(bandProgress.speaking || [])
    };

    // Prepare chart data
    const maxLength = Math.max(
      bandProgress.reading?.length || 0,
      bandProgress.listening?.length || 0,
      bandProgress.writing?.length || 0,
      bandProgress.speaking?.length || 0
    );

    const chartData = Array.from({ length: maxLength }, (_, i) => ({
      date: `Test ${i + 1}`,
      reading: bandProgress.reading?.[i] || null,
      listening: bandProgress.listening?.[i] || null,
      writing: bandProgress.writing?.[i] || null,
      speaking: bandProgress.speaking?.[i] || null
    })).filter(d => d.reading || d.listening || d.writing || d.speaking);

    setDisplayData({
      bandProgress,
      learningPath: learningPath || {},
      averages,
      trends,
      chartData
    });
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          📊 Learning Analytics
        </h2>
        <p className="text-gray-600 mt-2">
          Track your progress and receive AI-powered recommendations
        </p>
      </motion.div>

      {/* Band Progress Chart & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BandChart data={displayData.chartData} />
        <BandForecastCard bandProgress={displayData.bandProgress} />
      </div>

      {/* Skill Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['reading', 'listening', 'writing', 'speaking'].map((skill) => (
          <SkillSummaryCard
            key={skill}
            skill={skill}
            avg={displayData.averages[skill] || 0}
            trend={displayData.trends[skill] || 0}
          />
        ))}
      </div>

      {/* AI Learning Path Panel */}
      <LearningPathPanel path={displayData.learningPath} />
    </div>
  );
};

export default DashboardAI;


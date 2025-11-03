/**
 * AI Supervisor Panel Component
 * Displays Cambridge AI Supervisor report with trend analysis
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AISupervisorPanel = ({ userId }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/api/ai/supervisor/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        
        if (result.success && result.data) {
          setReport(result.data);
        } else {
          setError(result.message || 'Unable to fetch AI supervisor report');
        }
      } catch (err) {
        console.error('[AISupervisorPanel] Fetch error:', err);
        setError('Failed to load AI supervisor report');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchReport();
    }
  }, [userId, API_BASE_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-8 border border-indigo-100"
      >
        <h3 className="text-xl font-semibold text-indigo-700 mb-3">
          🧠 Cambridge AI Supervisor
        </h3>
        <p className="text-gray-600 text-center">
          {error || 'Complete more tests to receive AI supervision insights.'}
        </p>
      </motion.div>
    );
  }

  const getTrendIcon = (trend) => {
    if (trend === 'upward') return '📈';
    if (trend === 'downward') return '📉';
    return '📊';
  };

  const getTrendColor = (trend) => {
    if (trend === 'upward') return 'text-green-600';
    if (trend === 'downward') return 'text-red-600';
    return 'text-blue-600';
  };

  const getTrendBg = (trend) => {
    if (trend === 'upward') return 'bg-green-50 border-green-200';
    if (trend === 'downward') return 'bg-red-50 border-red-200';
    return 'bg-blue-50 border-blue-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 border-b border-blue-500">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">
            🧠 Cambridge AI Supervisor
          </h2>
          <span className="text-sm text-white/80">
            {report.testCount} {report.testCount === 1 ? 'test' : 'tests'} analyzed
          </span>
        </div>
        <p className="text-white/90 text-sm">
          Weekly progress analysis & adaptive recommendations
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Trend Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
            <p className="text-xs text-gray-300 mb-1">Trend</p>
            <p className={`text-2xl font-bold ${getTrendColor(report.trend)}`}>
              {getTrendIcon(report.trend)}
            </p>
            <p className="text-xs text-white/80 capitalize mt-1">{report.trend}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
            <p className="text-xs text-gray-300 mb-1">Current</p>
            <p className="text-2xl font-bold text-white">{report.avgBand.toFixed(1)}</p>
            <p className="text-xs text-white/80 mt-1">Average Band</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
            <p className="text-xs text-gray-300 mb-1">Target</p>
            <p className="text-2xl font-bold text-yellow-400">{report.targetBand}</p>
            <p className="text-xs text-white/80 mt-1">Goal Band</p>
          </div>
        </div>

        {/* AI Action Card */}
        <div className={`${getTrendBg(report.supervisorAction.tone)} rounded-xl p-5 border-2`}>
          <div className="flex items-start space-x-3 mb-3">
            <span className="text-2xl">
              {report.supervisorAction.tone === 'positive' ? '✅' : 
               report.supervisorAction.tone === 'supportive' ? '💪' : '🎯'}
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">
                {report.supervisorAction.action}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {report.supervisorAction.message}
              </p>
            </div>
          </div>
          {report.supervisorAction.suggestion && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                💡 <strong>Tip:</strong> {report.supervisorAction.suggestion}
              </p>
            </div>
          )}
        </div>

        {/* Skills Breakdown */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-semibold text-white mb-3">📊 Skills Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(report.bandTrends)
              .filter(([_, score]) => score > 0)
              .map(([skill, score]) => (
                <div key={skill} className="bg-black/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-300 mb-1 capitalize">{skill}</p>
                  <p className="text-lg font-bold text-white">{score.toFixed(1)}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Next Level Recommendation */}
        {report.nextRecommendedLevel && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
            <p className="text-sm font-medium mb-1">
              🎓 Recommended Next Level
            </p>
            <p className="text-2xl font-bold">
              {report.nextRecommendedLevel}
            </p>
          </div>
        )}

        {/* Summary Footer */}
        <div className="pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>Strength: {report.strongestSkill} • Weakness: {report.weakestSkill}</span>
            <span>
              Updated: {new Date(report.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AISupervisorPanel;


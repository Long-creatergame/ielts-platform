/**
 * Mode Analytics Card
 * Displays user's performance across Academic vs General Training modes
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ModeAnalyticsCard = ({ userId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/mode-analytics/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error loading mode analytics:', error);
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

  if (!analytics || analytics.totalTests === 0) {
    return null;
  }

  const { analytics: stats, preferredMode } = analytics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-indigo-200"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">📊</span>
        Mode Performance
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Academic Mode */}
        <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-700">🎓 Academic</span>
            {preferredMode === 'academic' && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Preferred</span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats.avgBandAcademic > 0 ? stats.avgBandAcademic.toFixed(1) : '-'}
            </p>
            <p className="text-xs text-gray-600">
              {stats.academicTests || 0} {stats.academicTests === 1 ? 'test' : 'tests'} completed
            </p>
          </div>
        </div>

        {/* General Mode */}
        <div className="bg-white rounded-xl p-4 border-l-4 border-teal-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-teal-700">🌍 General</span>
            {preferredMode === 'general' && (
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">Preferred</span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats.avgBandGeneral > 0 ? stats.avgBandGeneral.toFixed(1) : '-'}
            </p>
            <p className="text-xs text-gray-600">
              {stats.generalTests || 0} {stats.generalTests === 1 ? 'test' : 'tests'} completed
            </p>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      {stats.academicTests > 0 && stats.generalTests > 0 && (
        <div className="mt-4 pt-4 border-t border-indigo-200">
          <p className="text-sm text-gray-700 text-center">
            {stats.avgBandAcademic > stats.avgBandGeneral 
              ? '🎯 You perform better in Academic mode'
              : stats.avgBandGeneral > stats.avgBandAcademic
              ? '🎯 You perform better in General mode'
              : '🎯 Your performance is balanced across both modes'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ModeAnalyticsCard;


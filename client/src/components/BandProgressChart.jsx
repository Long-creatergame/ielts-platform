/**
 * Band Progress Chart Component
 * Displays band score progression over time for each skill
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import Loader from './Loader';

export default function BandProgressChart() {
  const [loading, setLoading] = useState(true);
  const [skillHistory, setSkillHistory] = useState(null);
  const [activeSkill, setActiveSkill] = useState('reading');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBandHistory();
  }, []);

  const loadBandHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/user-results/history/timeline`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSkillHistory(data.data);
          console.info('[BandHistory] Timeline loaded successfully');
        } else {
          setError('Failed to load band history');
        }
      } else {
        setError('Failed to load band history');
      }
    } catch (err) {
      console.error('Error loading band history:', err);
      setError('Failed to load band history');
    } finally {
      setLoading(false);
    }
  };

  const getSkillEmoji = (skill) => {
    const emojis = {
      reading: '📖',
      listening: '🎧',
      writing: '✍️',
      speaking: '🎤'
    };
    return emojis[skill] || '📊';
  };

  const getSkillColor = (skill) => {
    const colors = {
      reading: '#3b82f6', // blue
      listening: '#8b5cf6', // purple
      writing: '#ef4444', // red
      speaking: '#10b981' // green
    };
    return colors[skill] || '#6b7280';
  };

  const calculateAverage = (history) => {
    if (!history || history.length === 0) return 0;
    const sum = history.reduce((acc, item) => acc + item.band, 0);
    return Math.round((sum / history.length) * 10) / 10;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center p-8">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (!skillHistory || Object.values(skillHistory).every(arr => arr.length === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📈 Band Progress Over Time</h2>
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-2">Start your first test to see progress!</p>
          <p className="text-gray-500 text-sm">Complete Reading, Listening, Writing, or Speaking tests to track your improvement over time.</p>
        </div>
      </div>
    );
  }

  const currentHistory = skillHistory[activeSkill] || [];
  const average = calculateAverage(currentHistory);
  const latestBand = currentHistory.length > 0 ? currentHistory[currentHistory.length - 1].band : 0;
  const firstTestDate = currentHistory.length > 0 ? currentHistory[0].date : null;
  const lastTestDate = currentHistory.length > 0 ? currentHistory[currentHistory.length - 1].date : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Band Progress Over Time</h2>
      
      {/* Skill Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['reading', 'listening', 'writing', 'speaking'].map(skill => {
          const history = skillHistory[skill] || [];
          const hasData = history.length > 0;
          const avg = calculateAverage(history);
          
          return (
            <button
              key={skill}
              onClick={() => setActiveSkill(skill)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                activeSkill === skill
                  ? 'bg-blue-600 text-white'
                  : hasData
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!hasData}
            >
              <span className="text-lg">{getSkillEmoji(skill)}</span>
              <span className="capitalize">{skill}</span>
              {hasData && (
                <span className={`text-sm ${
                  activeSkill === skill ? 'bg-white/20' : 'bg-gray-200'
                } px-2 py-0.5 rounded-full`}>
                  {avg}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Statistics */}
      {currentHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4"
          >
            <div className="text-sm text-blue-700 font-medium mb-1">Latest Band</div>
            <div className="text-3xl font-bold text-blue-900">{latestBand}</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4"
          >
            <div className="text-sm text-green-700 font-medium mb-1">Average</div>
            <div className="text-3xl font-bold text-green-900">{average}</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-4"
          >
            <div className="text-sm text-purple-700 font-medium mb-1">Tests Taken</div>
            <div className="text-3xl font-bold text-purple-900">{currentHistory.length}</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-xl p-4"
          >
            <div className="text-sm text-orange-700 font-medium mb-1">Improvement</div>
            <div className="text-3xl font-bold text-orange-900">
              {currentHistory.length > 1 ? 
                (currentHistory[currentHistory.length - 1].band - currentHistory[0].band).toFixed(1) : 
                '0.0'
              }
            </div>
          </motion.div>
        </div>
      )}

      {/* Line Chart */}
      {currentHistory.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 9]} 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
                labelFormatter={(label) => `Date: ${formatDate(label)}`}
                formatter={(value) => [`Band ${value}`, 'Band Score']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="band" 
                stroke={getSkillColor(activeSkill)} 
                strokeWidth={3} 
                dot={{ r: 5, fill: getSkillColor(activeSkill) }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {/* Test Range Info */}
          <div className="mt-4 text-center text-sm text-gray-600">
            {firstTestDate && lastTestDate && (
              <p>
                Showing progress from {formatDate(firstTestDate)} to {formatDate(lastTestDate)}
              </p>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No test data available for this skill yet.</p>
        </div>
      )}
    </div>
  );
}

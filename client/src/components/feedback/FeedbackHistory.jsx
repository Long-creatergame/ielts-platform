/**
 * Feedback History Component
 * Displays feedback history with comparative analytics
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FeedbackHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const skillParam = selectedSkill !== 'all' ? `&skill=${selectedSkill}` : '';
        const response = await fetch(
          `${API_BASE_URL}/api/feedback/history/${userId}?sortBy=newest${skillParam}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const result = await response.json();
        const historyData = result.data?.history || [];
        setHistory(historyData);
      } catch (error) {
        console.error('[FeedbackHistory] Fetch error:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchHistory();
    }
  }, [userId, selectedSkill, API_BASE_URL]);

  // Filter history by skill
  const filteredHistory = selectedSkill === 'all' 
    ? history 
    : history.filter(h => h.skill === selectedSkill);

  // Prepare chart data
  const chartData = filteredHistory.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Grammar: item.bandBreakdown.Grammar || 0,
    Vocabulary: item.bandBreakdown.Vocabulary || 0,
    Coherence: item.bandBreakdown.Coherence || 0,
    Task: item.bandBreakdown.Task || 0,
    Fluency: item.bandBreakdown.Fluency || 0,
    Pronunciation: item.bandBreakdown.Pronunciation || 0,
    index
  })).reverse();

  const getCriteriaForSkill = (skill) => {
    if (skill === 'writing') {
      return [
        { name: 'Grammar', color: '#ef4444', icon: '📖' },
        { name: 'Vocabulary', color: '#f59e0b', icon: '📚' },
        { name: 'Coherence', color: '#3b82f6', icon: '🔗' },
        { name: 'Task', color: '#35b86d', icon: '🎯' }
      ];
    } else {
      return [
        { name: 'Fluency', color: '#8b5cf6', icon: '💬' },
        { name: 'Pronunciation', color: '#ec4899', icon: '🎤' },
        { name: 'Grammar', color: '#ef4444', icon: '📖' },
        { name: 'Vocabulary', color: '#f59e0b', icon: '📚' }
      ];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const primarySkill = filteredHistory.length > 0 ? filteredHistory[0].skill : 'writing';
  const criteria = getCriteriaForSkill(primarySkill);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Feedback History & Analytics
        </h2>
        <p className="text-gray-600">
          Track your progress and compare performance over time
        </p>
      </motion.div>

      {/* Skill Filter */}
      <div className="flex justify-center space-x-3">
        {['all', 'writing', 'speaking'].map(skill => (
          <motion.button
            key={skill}
            onClick={() => setSelectedSkill(skill)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedSkill === skill
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {skill === 'all' ? 'All' : skill.charAt(0).toUpperCase() + skill.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Chart */}
      {filteredHistory.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-indigo-600 mb-4">
            Band Progress Over Time
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                domain={[3, 9]} 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {criteria.map(c => (
                <Line
                  key={c.name}
                  type="monotone"
                  dataKey={c.name}
                  stroke={c.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={c.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No feedback history yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Complete Writing or Speaking tests to see your analytics
          </p>
        </div>
      )}

      {/* History List */}
      {filteredHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.slice(0, 12).map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer"
              onClick={() => setSelectedFeedback(item)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg">
                  {item.skill === 'writing' ? '✍️' : '🎤'}
                </span>
                <span className="text-xs font-medium text-gray-600 uppercase">
                  {item.skill} • {item.level}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                {Object.entries(item.bandBreakdown)
                  .filter(([_, score]) => score > 0)
                  .slice(0, 2)
                  .map(([criteria, score]) => (
                    <div key={criteria} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{criteria}:</span>
                      <span className="font-bold text-indigo-700">{score.toFixed(1)}</span>
                    </div>
                  ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm font-semibold text-gray-900">
                  Avg: {item.averageBand.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Popup for detailed feedback */}
      <AnimatePresence>
        {selectedFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedFeedback(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-indigo-600">
                    {selectedFeedback.skill === 'writing' ? '✍️' : '🎤'} Full Feedback
                  </h3>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(selectedFeedback.bandBreakdown)
                      .filter(([_, score]) => score > 0)
                      .map(([criteria, score]) => (
                        <div key={criteria} className="bg-indigo-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-600 mb-1">{criteria}</p>
                          <p className="text-2xl font-bold text-indigo-700">{score.toFixed(1)}</p>
                        </div>
                      ))}
                  </div>

                  {selectedFeedback.aiMessage && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                      <p className="text-sm text-gray-800">{selectedFeedback.aiMessage}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Test Date: {new Date(selectedFeedback.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Level: {selectedFeedback.level} | Average Band: {selectedFeedback.averageBand.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackHistory;


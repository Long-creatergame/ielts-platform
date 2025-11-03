/**
 * Band Chart Component
 * Displays band progress over time for all 4 skills
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const BandChart = ({ data }) => {
  const isEmpty = !data || data.length === 0;

  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-indigo-600">📊 Band Progress</h3>
        <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
          <p className="text-sm">Complete your first test to see progress!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
    >
      <h3 className="text-lg md:text-xl font-semibold mb-4 text-indigo-600">
        📊 Band Progress Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line 
            type="monotone" 
            dataKey="reading" 
            stroke="#4f46e5" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Reading"
          />
          <Line 
            type="monotone" 
            dataKey="listening" 
            stroke="#35b86d" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Listening"
          />
          <Line 
            type="monotone" 
            dataKey="writing" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Writing"
          />
          <Line 
            type="monotone" 
            dataKey="speaking" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Speaking"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default BandChart;


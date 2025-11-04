/**
 * Assessment Summary Component
 * Displays Cambridge IELTS Assessment Results with CEFR Level
 * Shows overall band, skill breakdown, and adaptive learning path
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AssessmentSummary = ({ assessment, learningPath, testId }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  if (!assessment) {
    return null;
  }

  const { bands, overall, cefr } = assessment;

  const getCEFRLabel = (cefrLevel) => {
    const labels = {
      'A1': 'Beginner',
      'A2': 'Elementary',
      'B1': 'Intermediate',
      'B2': 'Upper-Intermediate',
      'C1': 'Advanced',
      'C2': 'Proficient'
    };
    return labels[cefrLevel] || cefrLevel;
  };

  const getCEFRColor = (cefrLevel) => {
    const colors = {
      'A1': 'bg-gray-100 text-gray-700',
      'A2': 'bg-blue-100 text-blue-700',
      'B1': 'bg-green-100 text-green-700',
      'B2': 'bg-yellow-100 text-yellow-700',
      'C1': 'bg-orange-100 text-orange-700',
      'C2': 'bg-purple-100 text-purple-700'
    };
    return colors[cefrLevel] || 'bg-gray-100 text-gray-700';
  };

  const getBandColor = (band) => {
    if (band >= 8.0) return 'text-purple-600';
    if (band >= 7.0) return 'text-blue-600';
    if (band >= 6.0) return 'text-green-600';
    if (band >= 5.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-xl border-2 border-indigo-200 p-6 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎓</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">IELTS Assessment Result</h2>
            <p className="text-sm text-gray-600">Cambridge Official Format</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-4 py-2 bg-white/70 hover:bg-white rounded-xl transition-colors"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Overall Band & CEFR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-indigo-200">
          <p className="text-sm font-semibold text-gray-600 mb-2">Overall Band</p>
          <p className={`text-4xl font-bold ${getBandColor(overall)}`}>
            {overall.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">out of 9.0</p>
        </div>
        <div className={`rounded-2xl p-6 ${getCEFRColor(cefr)} border-2`}>
          <p className="text-sm font-semibold mb-2">English Level</p>
          <p className="text-4xl font-bold">
            {cefr}
          </p>
          <p className="text-xs mt-1">{getCEFRLabel(cefr)}</p>
        </div>
      </div>

      {/* Skill Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(bands).map(([skill, band]) => (
            <div
              key={skill}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors"
            >
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                {skill}
              </p>
              <p className={`text-2xl font-bold ${getBandColor(band)}`}>
                {band > 0 ? band.toFixed(1) : '-'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Path */}
      {learningPath && expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/80 rounded-2xl p-6 border border-indigo-200 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🧭</span>
            Your Adaptive Learning Path
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Target Band:</span>
              <span className="text-lg font-bold text-indigo-600">
                {learningPath.targetBand?.toFixed(1) || overall + 0.5}
              </span>
            </div>
            {learningPath.nextCEFR && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Next Level:</span>
                <span className={`px-3 py-1 rounded-lg font-semibold ${getCEFRColor(learningPath.nextCEFR)}`}>
                  {learningPath.nextCEFR}
                </span>
              </div>
            )}
            {learningPath.suggestedPlan && learningPath.suggestedPlan.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Focus Areas:</p>
                <div className="space-y-2">
                  {learningPath.suggestedPlan.slice(0, 3).map((plan, idx) => (
                    <div key={idx} className="bg-indigo-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 capitalize">
                          {plan.skill}
                        </span>
                        <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
                          {plan.priority || 'medium'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{plan.focus}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Duration: {plan.duration} • Goal: Band {plan.goalBand?.toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {learningPath && (
          <button
            onClick={() => navigate('/learning-path')}
            className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            View My Study Plan
          </button>
        )}
        {testId && (
          <button
            onClick={() => navigate(`/test/result/${testId}`)}
            className="flex-1 md:flex-none px-6 py-3 bg-white border-2 border-indigo-300 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
          >
            View Test Details
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default AssessmentSummary;

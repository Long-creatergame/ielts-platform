/**
 * AI Correction Panel Component
 * Displays detailed error corrections with explanations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AICorrectionPanel = ({ feedback = [] }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!feedback || feedback.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-600 mb-4">
          🧠 AI Feedback
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <p className="text-sm text-center">
            Great work! No critical errors detected.
          </p>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (error) => {
    if (!error || !error.type) return '📝';
    const type = error.type.toLowerCase();
    if (type.includes('grammar')) return '📖';
    if (type.includes('vocab') || type.includes('lexical')) return '📚';
    if (type.includes('coherence')) return '🔗';
    if (type.includes('task')) return '🎯';
    return '📝';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h3 className="text-lg font-semibold text-indigo-600 mb-4">
        🧠 AI Feedback & Corrections
      </h3>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {feedback.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-indigo-500 hover:shadow-md transition-shadow"
          >
            {/* Category Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getCategoryIcon(item)}</span>
                <span className="text-xs font-semibold text-indigo-600 uppercase">
                  {item.type || 'General'}
                </span>
              </div>
              {item.suggestion && (
                <button
                  onClick={() => handleCopy(item.suggestion, index)}
                  className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {copiedIndex === index ? '✅ Copied!' : '📋 Copy'}
                </button>
              )}
            </div>

            {/* Error */}
            {item.error && (
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-600 mb-1">Current:</p>
                <p className="text-sm font-medium text-red-700 bg-red-50 rounded px-3 py-2 border border-red-200">
                  ❌ {item.error}
                </p>
              </div>
            )}

            {/* Suggestion */}
            {item.suggestion && (
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-600 mb-1">Suggestion:</p>
                <p className="text-sm font-medium text-green-700 bg-green-50 rounded px-3 py-2 border border-green-200">
                  ✅ {item.suggestion}
                </p>
              </div>
            )}

            {/* Explanation */}
            {item.reason && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 leading-relaxed">
                  💡 <strong>Why:</strong> {item.reason}
                </p>
              </div>
            )}

            {/* Example (optional) */}
            {item.example && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">Example:</p>
                <p className="text-xs text-indigo-700 italic bg-indigo-50 rounded px-3 py-2 border border-indigo-200">
                  "{item.example}"
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          {feedback.length} {feedback.length === 1 ? 'correction' : 'corrections'} provided
        </p>
      </div>
    </motion.div>
  );
};

export default AICorrectionPanel;


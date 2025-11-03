/**
 * AI Highlight Layer Component for Writing
 * Highlights errors in text with color-coded categories
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIHighlightLayer = ({ text, errors = [] }) => {
  const [hoveredError, setHoveredError] = useState(null);

  if (!text) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
        <p>No text available for analysis</p>
      </div>
    );
  }

  // Split text into words, preserving punctuation
  const words = text.split(/(\s+|[.,!?;:])/);

  const getErrorCategory = (error) => {
    if (!error || !error.type) return null;
    const type = error.type.toLowerCase();
    if (type.includes('grammar')) return 'grammar';
    if (type.includes('vocab') || type.includes('lexical')) return 'vocab';
    if (type.includes('coherence') || type.includes('cohesion')) return 'coherence';
    if (type.includes('task')) return 'task';
    return 'other';
  };

  const getHighlightColor = (category) => {
    const colors = {
      grammar: 'bg-red-200 hover:bg-red-300 border-red-400',
      vocab: 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400',
      coherence: 'bg-blue-200 hover:bg-blue-300 border-blue-400',
      task: 'bg-green-200 hover:bg-green-300 border-green-400',
      other: 'bg-gray-200 hover:bg-gray-300 border-gray-400'
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      grammar: 'Grammar',
      vocab: 'Vocabulary',
      coherence: 'Coherence',
      task: 'Task Response',
      other: 'Other'
    };
    return labels[category] || 'Error';
  };

  // Create a map of error positions
  const errorMap = new Map();
  errors.forEach((error, idx) => {
    const wordIndices = error.wordIndex !== undefined 
      ? [error.wordIndex] 
      : (error.wordIndices || []);
    wordIndices.forEach(wordIdx => {
      if (!errorMap.has(wordIdx)) {
        errorMap.set(wordIdx, []);
      }
      errorMap.get(wordIdx).push({ ...error, _idx: idx });
    });
  });

  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-indigo-600 mb-4">
        📝 Your Writing with AI Feedback
      </h3>

      <div className="prose max-w-none leading-relaxed">
        <p className="text-gray-800 whitespace-pre-wrap">
          {words.map((word, wordIndex) => {
            const wordErrors = errorMap.get(wordIndex);
            if (!wordErrors || wordErrors.length === 0) {
              return <span key={wordIndex}>{word}</span>;
            }

            const primaryError = wordErrors[0];
            const category = getErrorCategory(primaryError);

            return (
              <span key={wordIndex}>
                <motion.span
                  className={`${getHighlightColor(category)} px-1 rounded cursor-pointer border border-dashed transition-colors`}
                  onHoverStart={() => setHoveredError({ wordIndex, errors: wordErrors })}
                  onHoverEnd={() => setHoveredError(null)}
                  initial={{ opacity: 0.8 }}
                  whileHover={{ scale: 1.05, opacity: 1 }}
                >
                  {word}
                </motion.span>
              </span>
            );
          })}
        </p>
      </div>

      {/* Tooltip/Popup for error details */}
      <AnimatePresence>
        {hoveredError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm"
            style={{
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px'
            }}
          >
            {hoveredError.errors.map((error, idx) => (
              <div key={idx} className="mb-3 last:mb-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-semibold text-indigo-600 px-2 py-1 bg-indigo-50 rounded">
                    {getCategoryLabel(getErrorCategory(error))}
                  </span>
                </div>
                {error.error && (
                  <p className="text-sm text-red-700 font-medium mb-1">
                    ❌ {error.error}
                  </p>
                )}
                {error.suggestion && (
                  <p className="text-sm text-green-700 font-medium mb-1">
                    ✅ {error.suggestion}
                  </p>
                )}
                {error.reason && (
                  <p className="text-xs text-gray-600">
                    💡 {error.reason}
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      {errors.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">Legend:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded bg-red-200 border border-red-400"></span>
              <span>Grammar</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400"></span>
              <span>Vocabulary</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded bg-blue-200 border border-blue-400"></span>
              <span>Coherence</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded bg-green-200 border border-green-400"></span>
              <span>Task Response</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIHighlightLayer;


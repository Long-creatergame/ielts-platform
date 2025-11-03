/**
 * Speaking Transcript Analyzer Component
 * Displays AI analysis of speaking performance
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SpeakingTranscriptAnalyzer = ({ transcript, highlights = [] }) => {
  const [hoveredHighlight, setHoveredHighlight] = useState(null);

  if (!transcript) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-600 mb-4">
          🗣️ AI Speaking Feedback
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <p className="text-sm text-center">No transcript available for analysis</p>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (highlight) => {
    if (!highlight || !highlight.type) return '🎤';
    const type = highlight.type.toLowerCase();
    if (type.includes('fluency')) return '💬';
    if (type.includes('pronunciation') || type.includes('pronunciation')) return '🎵';
    if (type.includes('grammar')) return '📖';
    if (type.includes('vocab') || type.includes('lexical')) return '📚';
    return '🎤';
  };

  const getCategoryLabel = (highlight) => {
    if (!highlight || !highlight.type) return 'General';
    const type = highlight.type.toLowerCase();
    if (type.includes('fluency')) return 'Fluency';
    if (type.includes('pronunciation')) return 'Pronunciation';
    if (type.includes('grammar')) return 'Grammar';
    if (type.includes('vocab')) return 'Vocabulary';
    return 'General';
  };

  const words = transcript.split(/(\s+|[.,!?;:])/);

  // Create a map of highlight positions
  const highlightMap = new Map();
  highlights.forEach((highlight, idx) => {
    const wordIndices = highlight.wordIndex !== undefined 
      ? [highlight.wordIndex] 
      : (highlight.wordIndices || []);
    wordIndices.forEach(wordIdx => {
      if (!highlightMap.has(wordIdx)) {
        highlightMap.set(wordIdx, []);
      }
      highlightMap.get(wordIdx).push({ ...highlight, _idx: idx });
    });
  });

  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-indigo-600 mb-4">
        🗣️ AI Speaking Feedback
      </h3>

      <div className="prose max-w-none leading-relaxed mb-6">
        <p className="text-gray-800 whitespace-pre-wrap">
          {words.map((word, wordIndex) => {
            const wordHighlights = highlightMap.get(wordIndex);
            if (!wordHighlights || wordHighlights.length === 0) {
              return <span key={wordIndex}>{word}</span>;
            }

            const primaryHighlight = wordHighlights[0];

            return (
              <span key={wordIndex}>
                <motion.span
                  className="underline decoration-dotted decoration-red-400 hover:text-red-600 cursor-pointer transition-colors"
                  onHoverStart={() => setHoveredHighlight({ wordIndex, highlights: wordHighlights })}
                  onHoverEnd={() => setHoveredHighlight(null)}
                  whileHover={{ scale: 1.05 }}
                >
                  {word}
                </motion.span>
              </span>
            );
          })}
        </p>
      </div>

      {/* Tooltip/Popup for highlight details */}
      <AnimatePresence>
        {hoveredHighlight && (
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
            {hoveredHighlight.highlights.map((highlight, idx) => (
              <div key={idx} className="mb-3 last:mb-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">{getCategoryIcon(highlight)}</span>
                  <span className="text-xs font-semibold text-indigo-600 px-2 py-1 bg-indigo-50 rounded">
                    {getCategoryLabel(highlight)}
                  </span>
                </div>
                {highlight.tip && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    💡 {highlight.tip}
                  </p>
                )}
                {highlight.suggestion && (
                  <p className="text-sm text-green-700 font-medium mt-2">
                    ✅ {highlight.suggestion}
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Highlights Summary */}
      {highlights.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-3">
            Key Feedback Points:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {highlights.slice(0, 6).map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 bg-blue-50 rounded-lg p-3 border border-blue-200"
              >
                <span className="text-lg flex-shrink-0">
                  {getCategoryIcon(highlight)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-indigo-600 mb-1">
                    {getCategoryLabel(highlight)}
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {highlight.tip || highlight.suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakingTranscriptAnalyzer;


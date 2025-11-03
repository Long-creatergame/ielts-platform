/**
 * Feedback Dashboard Component
 * Main layout for AI feedback display (Writing + Speaking)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AIHighlightLayer from './AIHighlightLayer';
import AICorrectionPanel from './AICorrectionPanel';
import BandBreakdownCard from './BandBreakdownCard';
import SpeakingTranscriptAnalyzer from './SpeakingTranscriptAnalyzer';

const FeedbackDashboard = ({ result = {}, targetBand = 6.5 }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const { writingFeedback, speakingFeedback, bandBreakdown } = result;

  const hasWritingFeedback = writingFeedback && (writingFeedback.text || writingFeedback.errors?.length > 0);
  const hasSpeakingFeedback = speakingFeedback && (speakingFeedback.transcript || speakingFeedback.highlights?.length > 0);

  if (!hasWritingFeedback && !hasSpeakingFeedback && !bandBreakdown) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <p className="text-gray-500 text-lg">No feedback data available</p>
        <p className="text-gray-400 text-sm mt-2">Complete a test to receive AI feedback</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🤖 AI-Powered Feedback
        </h2>
        <p className="text-gray-600">
          Detailed analysis and personalized improvement suggestions
        </p>
      </motion.div>

      {/* Band Breakdown - Always show if available */}
      {bandBreakdown && Object.keys(bandBreakdown).length > 0 && (
        <BandBreakdownCard bands={bandBreakdown} targetBand={targetBand} />
      )}

      {/* Tabs for Writing/Speaking */}
      {(hasWritingFeedback || hasSpeakingFeedback) && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide">
              {hasWritingFeedback && (
                <button
                  onClick={() => setActiveTab('writing')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'writing'
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">✍️</span>
                  <span>Writing Analysis</span>
                </button>
              )}
              {hasSpeakingFeedback && (
                <button
                  onClick={() => setActiveTab('speaking')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'speaking'
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="text-lg">🎤</span>
                  <span>Speaking Analysis</span>
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'writing' && hasWritingFeedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <AIHighlightLayer
                    text={writingFeedback.text}
                    errors={writingFeedback.errors || []}
                  />
                  <AICorrectionPanel
                    feedback={writingFeedback.errors || []}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'speaking' && hasSpeakingFeedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <SpeakingTranscriptAnalyzer
                  transcript={speakingFeedback.transcript}
                  highlights={speakingFeedback.highlights || []}
                />
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackDashboard;


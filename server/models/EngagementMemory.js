/**
 * Engagement Memory Model
 * Stores emotion, engagement, and behavioral data for AI emotional intelligence
 */

const mongoose = require('mongoose');

const EngagementMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  sentimentTrend: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  lastFeedbackTone: {
    type: String,
    default: 'balanced'
  },
  motivationScore: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 10
  },
  inactivityDays: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  improvementTrend: {
    type: String,
    enum: ['upward', 'flat', 'downward'],
    default: 'flat'
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  emotionHistory: [{
    timestamp: { type: Date, default: Date.now },
    emotion: String,
    tone: {
      type: String,
      enum: ['supportive', 'uplifting', 'motivating', 'encouraging', 'neutral'],
      default: 'neutral'
    },
    context: { type: String, default: 'learning' }
  }],
  engagementMetrics: {
    averageSessionDuration: { type: Number, default: 0 },
    practiceFrequency: { type: Number, default: 0 }, // sessions per week
    responseRate: { type: Number, default: 0 } // % of hints followed
  }
}, {
  timestamps: true
});

// Index for efficient queries
EngagementMemorySchema.index({ userId: 1 });
EngagementMemorySchema.index({ lastInteraction: -1 });
EngagementMemorySchema.index({ motivationScore: -1 });

module.exports = mongoose.model('EngagementMemory', EngagementMemorySchema);

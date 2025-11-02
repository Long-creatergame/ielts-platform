/**
 * Analytics Event Model
 * Lightweight event tracking for test usage analytics
 */

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    index: true
  },
  skill: {
    type: String,
    required: true,
    index: true
  },
  level: {
    type: String,
    required: true
  },
  event: {
    type: String,
    required: true,
    enum: ['TestStart', 'TestSubmit', 'AIFeedback'],
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
analyticsSchema.index({ user: 1, timestamp: -1 });
analyticsSchema.index({ skill: 1, event: 1 });
analyticsSchema.index({ event: 1, timestamp: -1 });

// TTL index: Auto-delete after 30 days (2592000 seconds)
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsSchema);

// Log when schema loads
console.log('[MongoDB] AnalyticsEvent schema loaded with 30-day TTL');

module.exports = AnalyticsEvent;


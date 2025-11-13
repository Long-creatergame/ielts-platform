const mongoose = require('mongoose');
let coreDB = null;

function getModelConnection() {
  if (!coreDB) {
    const { getCoreConnection } = require('../config/db');
    coreDB = getCoreConnection();
  }
  return coreDB;
}

/**
 * UserAnalytics Model - Tracks user performance analytics
 */
const userAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCore',
    required: true,
    unique: true,
    index: true
  },
  totalItemsCompleted: {
    type: Number,
    default: 0
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0
  },
  averageScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  averageBandScore: {
    type: Number,
    min: 0,
    max: 9,
    default: 0
  },
  skillScores: {
    reading: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      best: { type: Number, default: 0 }
    },
    listening: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      best: { type: Number, default: 0 }
    },
    writing: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      best: { type: Number, default: 0 }
    },
    speaking: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      best: { type: Number, default: 0 }
    }
  },
  levelProgress: {
    A1: { type: Number, default: 0 },
    A2: { type: Number, default: 0 },
    B1: { type: Number, default: 0 },
    B2: { type: Number, default: 0 },
    C1: { type: Number, default: 0 },
    C2: { type: Number, default: 0 }
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: { type: Date }
  },
  achievements: {
    type: [String],
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'useranalytics'
});

// Indexes
userAnalyticsSchema.index({ userId: 1 });
userAnalyticsSchema.index({ averageBandScore: -1 });
userAnalyticsSchema.index({ totalItemsCompleted: -1 });
userAnalyticsSchema.index({ lastUpdated: -1 });

function getUserAnalyticsModel() {
  return getModelConnection().model('UserAnalytics', userAnalyticsSchema);
}

const UserAnalytics = getUserAnalyticsModel();

module.exports = UserAnalytics;


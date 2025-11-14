const { getMongooseCore } = require('../config/db');

function getModelConnection() {
  try {
    return getMongooseCore();
  } catch (error) {
    throw new Error('[Core V3 UserAnalytics] Database connection not established. Call connectCoreDB() first.');
  }
}

const userAnalyticsSchema = new (getModelConnection().Schema)({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'all-time'],
    required: true,
    index: true,
  },
  periodStart: {
    type: Date,
    required: true,
    index: true,
  },
  periodEnd: {
    type: Date,
    required: true,
  },
  stats: {
    totalItems: { type: Number, default: 0 },
    completedItems: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageBandScore: { type: Number, default: 0 },
    skillsBreakdown: {
      reading: { type: Number, default: 0 },
      listening: { type: Number, default: 0 },
      writing: { type: Number, default: 0 },
      speaking: { type: Number, default: 0 },
    },
    timeSpent: { type: Number, default: 0 }, // in seconds
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes
userAnalyticsSchema.index({ userId: 1, period: 1, periodStart: -1 });
userAnalyticsSchema.index({ periodStart: -1 });

function getUserAnalyticsModel() {
  const mongooseCore = getModelConnection();
  return mongooseCore.models.UserAnalytics || mongooseCore.model('UserAnalytics', userAnalyticsSchema);
}

const UserAnalytics = getUserAnalyticsModel();
module.exports = UserAnalytics;


import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ event: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ userId: 1, event: 1, timestamp: -1 });

// Static methods for analytics queries
analyticsSchema.statics.getUserMetrics = async function(userId, startDate, endDate) {
  const matchQuery = { userId };
  
  if (startDate) {
    matchQuery.timestamp = { ...matchQuery.timestamp, $gte: new Date(startDate) };
  }
  
  if (endDate) {
    matchQuery.timestamp = { ...matchQuery.timestamp, $lte: new Date(endDate) };
  }

  return await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$event',
        count: { $sum: 1 },
        lastOccurrence: { $max: '$timestamp' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

analyticsSchema.statics.getTestPerformance = async function(userId) {
  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        event: 'test_complete'
      }
    },
    {
      $group: {
        _id: '$data.skill',
        totalTests: { $sum: 1 },
        averageScore: { $avg: '$data.score' },
        averageTime: { $avg: '$data.timeSpent' },
        lastTest: { $max: '$timestamp' }
      }
    },
    {
      $sort: { totalTests: -1 }
    }
  ]);
};

analyticsSchema.statics.getEngagementTrend = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        events: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        date: '$_id.date',
        events: 1,
        uniqueSessions: { $size: '$uniqueSessions' }
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;

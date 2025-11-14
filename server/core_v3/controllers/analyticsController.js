const UserAnalytics = require('../models/UserAnalytics');
const UserResponse = require('../models/UserResponse');
const Assignment = require('../models/Assignment');

exports.getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'all-time' } = req.query;

    let periodStart, periodEnd;
    const now = new Date();

    switch (period) {
      case 'daily':
        periodStart = new Date(now.setHours(0, 0, 0, 0));
        periodEnd = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        periodStart = new Date(weekStart.setHours(0, 0, 0, 0));
        periodEnd = new Date();
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date();
        break;
      default:
        periodStart = new Date(0);
        periodEnd = new Date();
    }

    // Get or create analytics record
    let analytics = await UserAnalytics.findOne({
      userId,
      period,
      periodStart: { $gte: periodStart, $lte: periodEnd },
    });

    if (!analytics) {
      // Calculate stats from responses
      const responses = await UserResponse.find({
        userId,
        submittedAt: { $gte: periodStart, $lte: periodEnd },
      });

      const stats = calculateStats(responses);

      analytics = new UserAnalytics({
        userId,
        period,
        periodStart,
        periodEnd,
        stats,
      });

      await analytics.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: { analytics },
    });
  } catch (error) {
    console.error('[Core V3 Analytics] Get user analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'all-time', limit = 50 } = req.query;

    let periodStart, periodEnd;
    const now = new Date();

    switch (period) {
      case 'daily':
        periodStart = new Date(now.setHours(0, 0, 0, 0));
        periodEnd = new Date();
        break;
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        periodStart = new Date(weekStart.setHours(0, 0, 0, 0));
        periodEnd = new Date();
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date();
        break;
      default:
        periodStart = new Date(0);
        periodEnd = new Date();
    }

    const leaderboard = await UserResponse.aggregate([
      {
        $match: {
          submittedAt: { $gte: periodStart, $lte: periodEnd },
        },
      },
      {
        $group: {
          _id: '$userId',
          averageScore: { $avg: '$score' },
          averageBandScore: { $avg: '$bandScore' },
          totalResponses: { $sum: 1 },
        },
      },
      {
        $sort: { averageBandScore: -1 },
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Leaderboard retrieved successfully',
      data: { leaderboard },
    });
  } catch (error) {
    console.error('[Core V3 Analytics] Get leaderboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Helper function to calculate stats
function calculateStats(responses) {
  if (!responses || responses.length === 0) {
    return {
      totalItems: 0,
      completedItems: 0,
      averageScore: 0,
      averageBandScore: 0,
      skillsBreakdown: {
        reading: 0,
        listening: 0,
        writing: 0,
        speaking: 0,
      },
      timeSpent: 0,
    };
  }

  const totalItems = responses.length;
  const completedItems = responses.filter(r => r.status === 'completed').length;
  const averageScore = responses.reduce((sum, r) => sum + (r.score || 0), 0) / totalItems;
  const averageBandScore = responses.reduce((sum, r) => sum + (r.bandScore || 0), 0) / totalItems;
  const timeSpent = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);

  return {
    totalItems,
    completedItems,
    averageScore: Math.round(averageScore * 100) / 100,
    averageBandScore: Math.round(averageBandScore * 100) / 100,
    skillsBreakdown: {
      reading: 0,
      listening: 0,
      writing: 0,
      speaking: 0,
    },
    timeSpent,
  };
}


const UserAnalytics = require('../models/UserAnalytics');
const UserResponse = require('../models/UserResponse');
const UserCore = require('../models/UserCore');

/**
 * Get user analytics
 */
async function getUserAnalytics(req, res) {
  try {
    const userId = req.user.userId;

    let analytics = await UserAnalytics.findOne({ userId });

    if (!analytics) {
      // Create default analytics
      analytics = new UserAnalytics({ userId });
      await analytics.save();
    }

    return res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    console.error('[Core V3 Analytics] Get analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
}

/**
 * Get user progress statistics
 */
async function getProgressStats(req, res) {
  try {
    const userId = req.user.userId;

    const responses = await UserResponse.find({ userId, isCompleted: true })
      .populate('itemId', 'skill level')
      .sort({ submittedAt: -1 });

    const stats = {
      totalCompleted: responses.length,
      bySkill: {
        reading: { count: 0, average: 0 },
        listening: { count: 0, average: 0 },
        writing: { count: 0, average: 0 },
        speaking: { count: 0, average: 0 }
      },
      byLevel: {
        A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0
      },
      recentScores: responses.slice(0, 10).map(r => ({
        date: r.submittedAt,
        score: r.score,
        bandScore: r.bandScore
      }))
    };

    responses.forEach(response => {
      if (response.itemId) {
        const skill = response.itemId.skill;
        const level = response.itemId.level;

        if (stats.bySkill[skill]) {
          stats.bySkill[skill].count++;
          stats.bySkill[skill].average = 
            (stats.bySkill[skill].average * (stats.bySkill[skill].count - 1) + response.score) / 
            stats.bySkill[skill].count;
        }

        if (stats.byLevel[level] !== undefined) {
          stats.byLevel[level]++;
        }
      }
    });

    return res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('[Core V3 Analytics] Get progress stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get progress stats',
      error: error.message
    });
  }
}

/**
 * Get leaderboard (admin or public)
 */
async function getLeaderboard(req, res) {
  try {
    const { limit = 10 } = req.query;

    const topUsers = await UserAnalytics.find()
      .sort({ averageBandScore: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .select('userId averageBandScore totalItemsCompleted');

    return res.json({
      success: true,
      data: { leaderboard: topUsers }
    });
  } catch (error) {
    console.error('[Core V3 Analytics] Get leaderboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
}

module.exports = {
  getUserAnalytics,
  getProgressStats,
  getLeaderboard
};


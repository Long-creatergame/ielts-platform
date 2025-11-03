/**
 * Mode Analytics Service
 * Tracks and analyzes user performance across Academic vs General Training modes
 */

const User = require('../models/User');

/**
 * Update mode usage statistics for a user
 */
async function updateModeUsage(userId, mode, skill, band, testId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.warn('[Mode Analytics] User not found:', userId);
      return null;
    }

    // Update preferred mode
    user.preferredMode = mode;

    // Add to mode history
    user.modeHistory.push({
      mode,
      skill,
      testId,
      band,
      date: new Date()
    });

    // Keep last 100 records
    if (user.modeHistory.length > 100) {
      user.modeHistory = user.modeHistory.slice(-100);
    }

    // Calculate average band for each mode
    const academicTests = user.modeHistory.filter(x => x.mode === 'academic');
    const generalTests = user.modeHistory.filter(x => x.mode === 'general');

    const avgBandAcademic = academicTests.length > 0
      ? academicTests.reduce((sum, test) => sum + (test.band || 0), 0) / academicTests.length
      : 0;

    const avgBandGeneral = generalTests.length > 0
      ? generalTests.reduce((sum, test) => sum + (test.band || 0), 0) / generalTests.length
      : 0;

    // Update mode analytics
    user.modeAnalytics = {
      academicTests: academicTests.length,
      generalTests: generalTests.length,
      avgBandAcademic: parseFloat(avgBandAcademic.toFixed(1)),
      avgBandGeneral: parseFloat(avgBandGeneral.toFixed(1))
    };

    await user.save();

    console.log(`[Mode Analytics] Updated for user ${userId}: ${mode} mode, band ${band}`);

    return user.modeAnalytics;
  } catch (error) {
    console.error('[Mode Analytics] Error:', error.message);
    return null;
  }
}

/**
 * Get mode analytics for a user
 */
async function getModeAnalytics(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.warn('[Mode Analytics] User not found:', userId);
      return null;
    }

    return {
      preferredMode: user.preferredMode || 'academic',
      modeHistory: user.modeHistory || [],
      analytics: user.modeAnalytics || {
        academicTests: 0,
        generalTests: 0,
        avgBandAcademic: 0,
        avgBandGeneral: 0
      },
      totalTests: (user.modeAnalytics?.academicTests || 0) + (user.modeAnalytics?.generalTests || 0)
    };
  } catch (error) {
    console.error('[Mode Analytics] Get analytics error:', error.message);
    return null;
  }
}

/**
 * Get mode analytics for all users (admin)
 */
async function getAllModeAnalytics() {
  try {
    const users = await User.find({}).select('modeAnalytics preferredMode');
    
    // Aggregate statistics
    let totalAcademic = 0;
    let totalGeneral = 0;
    let sumAcademic = 0;
    let sumGeneral = 0;

    users.forEach(user => {
      if (user.modeAnalytics) {
        totalAcademic += user.modeAnalytics.academicTests || 0;
        totalGeneral += user.modeAnalytics.generalTests || 0;
        sumAcademic += (user.modeAnalytics.academicTests || 0) * (user.modeAnalytics.avgBandAcademic || 0);
        sumGeneral += (user.modeAnalytics.generalTests || 0) * (user.modeAnalytics.avgBandGeneral || 0);
      }
    });

    const avgBandAcademic = totalAcademic > 0 ? sumAcademic / totalAcademic : 0;
    const avgBandGeneral = totalGeneral > 0 ? sumGeneral / totalGeneral : 0;

    return {
      academic: {
        totalTests: totalAcademic,
        avgBand: parseFloat(avgBandAcademic.toFixed(1)),
        users: users.filter(u => (u.modeAnalytics?.academicTests || 0) > 0).length
      },
      general: {
        totalTests: totalGeneral,
        avgBand: parseFloat(avgBandGeneral.toFixed(1)),
        users: users.filter(u => (u.modeAnalytics?.generalTests || 0) > 0).length
      },
      totalUsers: users.length
    };
  } catch (error) {
    console.error('[Mode Analytics] GetAll analytics error:', error.message);
    return null;
  }
}

/**
 * Get mode trend for a user (band progression over time)
 */
async function getModeTrend(userId, mode) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const filteredHistory = user.modeHistory.filter(h => h.mode === mode);
    
    // Calculate trend over last 10 tests
    const recentTests = filteredHistory.slice(-10);
    
    if (recentTests.length < 2) {
      return { trend: 'stable', change: 0 };
    }

    const firstHalf = recentTests.slice(0, Math.floor(recentTests.length / 2));
    const secondHalf = recentTests.slice(Math.floor(recentTests.length / 2));

    const avgFirst = firstHalf.reduce((sum, t) => sum + (t.band || 0), 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, t) => sum + (t.band || 0), 0) / secondHalf.length;

    const change = parseFloat((avgSecond - avgFirst).toFixed(1));

    if (change > 0.3) {
      return { trend: 'improving', change };
    } else if (change < -0.3) {
      return { trend: 'declining', change };
    }

    return { trend: 'stable', change };
  } catch (error) {
    console.error('[Mode Analytics] Get trend error:', error.message);
    return { trend: 'stable', change: 0 };
  }
}

module.exports = {
  updateModeUsage,
  getModeAnalytics,
  getAllModeAnalytics,
  getModeTrend
};


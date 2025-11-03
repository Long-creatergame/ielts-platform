/**
 * AI Supervisor Service
 * Monitors learning journey, adjusts difficulty, and generates weekly reports
 */

const User = require('../models/User');
const AIFeedback = require('../models/AIFeedback');
const Test = require('../models/Test');

/**
 * Run AI supervision for a user
 */
async function runAISupervision(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Fetch recent feedback and tests
    const feedbacks = await AIFeedback.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    const recentTests = await Test.find({ userId, completed: true })
      .sort({ dateTaken: -1 })
      .limit(20);

    if (!feedbacks.length && !recentTests.length) {
      console.log('[AI Supervisor] Insufficient data for user:', userId);
      return {
        message: 'Not enough data for supervision. Complete more tests to receive AI insights.',
        action: 'continue_practice'
      };
    }

    // Calculate band trends per skill
    const bandTrends = {};
    const skills = ['reading', 'listening', 'writing', 'speaking'];

    for (const skill of skills) {
      const skillTests = recentTests.filter(t => 
        t.skill === skill || t.skill === 'mixed'
      );

      const scores = skillTests.map(test => {
        // Get band from skillBands or totalBand
        if (test.skillBands && test.skillBands[skill]) {
          return test.skillBands[skill];
        }
        return test.totalBand || 0;
      }).filter(s => s > 0);

      bandTrends[skill] = scores.length
        ? parseFloat((scores.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / scores.length).toFixed(1))
        : 0;
    }

    // Calculate average band
    const validTrends = Object.values(bandTrends).filter(v => v > 0);
    const avgBand = validTrends.length > 0
      ? parseFloat((validTrends.reduce((a, b) => a + b, 0) / validTrends.length).toFixed(1))
      : 0;

    const targetBand = user.targetBand || 6.5;
    const bandDelta = avgBand - targetBand;

    // Determine trend
    let trend;
    if (bandDelta > 0.3) {
      trend = 'upward';
    } else if (bandDelta < -0.3) {
      trend = 'downward';
    } else {
      trend = 'stable';
    }

    // Determine supervisor action
    let supervisorAction = {};
    if (trend === 'upward') {
      supervisorAction = {
        tone: 'positive',
        action: 'Upgrade test difficulty',
        message: `Excellent progress! You're trending above your target (${avgBand} vs ${targetBand}). Let's challenge yourself with higher difficulty.`,
        suggestion: 'Try taking tests at a higher level to maintain momentum.'
      };
    } else if (trend === 'downward') {
      supervisorAction = {
        tone: 'supportive',
        action: 'Focus on fundamentals',
        message: `Your performance is below target (${avgBand} vs ${targetBand}). Let's strengthen foundations before advancing.`,
        suggestion: 'Review basic concepts and take easier practice tests this week.'
      };
    } else {
      supervisorAction = {
        tone: 'neutral',
        action: 'Maintain current difficulty',
        message: `You're maintaining consistent progress near your target band (${avgBand}).`,
        suggestion: 'Continue with your current practice routine.'
      };
    }

    // Find strongest and weakest skills
    const skillEntries = Object.entries(bandTrends).filter(([_, score]) => score > 0);
    skillEntries.sort((a, b) => b[1] - a[1]);
    
    const strongestSkill = skillEntries.length > 0 ? skillEntries[0][0] : 'none';
    const weakestSkill = skillEntries.length > 0 ? skillEntries[skillEntries.length - 1][0] : 'none';

    // Generate supervision report
    const report = {
      userId,
      avgBand,
      targetBand,
      bandDelta,
      trend,
      bandTrends,
      strongestSkill,
      weakestSkill,
      supervisorAction,
      testCount: recentTests.length,
      feedbackCount: feedbacks.length,
      lastUpdated: new Date(),
      nextRecommendedLevel: determineNextLevel(trend, avgBand, user.currentLevel)
    };

    console.log(`[AI Supervisor] ✅ Generated report for user ${userId}: ${trend} trend`);
    
    return report;
  } catch (error) {
    console.error('[AI Supervisor] Error:', error.message);
    return null;
  }
}

/**
 * Determine next recommended level
 */
function determineNextLevel(trend, avgBand, currentLevel) {
  const levelProgression = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levelProgression.indexOf(currentLevel);

  if (trend === 'upward' && avgBand >= 7.0 && currentIndex < levelProgression.length - 1) {
    return levelProgression[currentIndex + 1];
  } else if (trend === 'downward' && avgBand < 5.0 && currentIndex > 0) {
    return levelProgression[currentIndex - 1];
  }
  
  return currentLevel;
}

module.exports = {
  runAISupervision,
  determineNextLevel
};


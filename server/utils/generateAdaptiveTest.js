/**
 * Adaptive Test Generation Utility
 * Generates IELTS tests based on user performance and level
 */

const { calculateNextLevel } = require('./adaptiveScaling');
const User = require('../models/User');

/**
 * Generate adaptive test configuration based on user's performance
 * @param {string} userId - User ID
 * @returns {object} Test configuration with adjusted level
 */
async function generateAdaptiveTest(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      console.warn('[GenerateAdaptiveTest] User not found:', userId);
      return {
        level: 'B1',
        adjustedLevel: 'B1',
        targetBand: 6.5,
        reason: 'User not found, using defaults'
      };
    }

    const currentLevel = user.currentLevel || 'B1';
    const targetBand = user.targetBand || 6.5;
    const performanceHistory = user.performanceHistory || [];

    console.log(`[AI Adaptive] User: ${user.email}`);
    console.log(`[AI Adaptive] Current Level: ${currentLevel} | Target Band: ${targetBand}`);
    
    // Calculate next level based on performance
    const adjustedLevel = calculateNextLevel(performanceHistory, currentLevel, targetBand);
    
    // Determine reason for level adjustment
    let reason = 'Maintaining current level';
    if (adjustedLevel !== currentLevel) {
      const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const currentIdx = levelOrder.indexOf(currentLevel);
      const adjustedIdx = levelOrder.indexOf(adjustedLevel);
      
      reason = adjustedIdx > currentIdx 
        ? 'Upgraded based on strong performance' 
        : 'Downgraded for more practice';
    }

    console.log(`[AI Adaptive] Adjusted Level: ${adjustedLevel} | Reason: ${reason}`);

    return {
      level: currentLevel,
      adjustedLevel,
      targetBand,
      reason,
      performanceHistory: performanceHistory.length
    };
  } catch (error) {
    console.error('[GenerateAdaptiveTest] Error:', error.message);
    return {
      level: 'B1',
      adjustedLevel: 'B1',
      targetBand: 6.5,
      reason: 'Error occurred, using defaults'
    };
  }
}

/**
 * Update user's performance history after a test
 * @param {string} userId - User ID
 * @param {string} testId - Test ID
 * @param {number} band - Band score
 * @param {string} skill - Skill tested
 */
async function updatePerformanceHistory(userId, testId, band, skill) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      console.warn('[UpdatePerformanceHistory] User not found:', userId);
      return;
    }

    // Add to performance history
    user.performanceHistory.push({
      testId,
      band,
      skill,
      date: new Date()
    });

    // Keep only last 20 records to avoid growing too large
    if (user.performanceHistory.length > 20) {
      user.performanceHistory = user.performanceHistory.slice(-20);
    }

    // Check if level should be adjusted
    const adjustedLevel = calculateNextLevel(
      user.performanceHistory, 
      user.currentLevel, 
      user.targetBand
    );

    // Update user level if changed
    if (adjustedLevel !== user.currentLevel) {
      console.log(`[UpdatePerformanceHistory] Updating user level: ${user.currentLevel} → ${adjustedLevel}`);
      user.currentLevel = adjustedLevel;
    }

    await user.save();
    console.log(`[UpdatePerformanceHistory] History updated for user: ${userId}, band: ${band}, skill: ${skill}`);
  } catch (error) {
    console.error('[UpdatePerformanceHistory] Error:', error.message);
  }
}

module.exports = {
  generateAdaptiveTest,
  updatePerformanceHistory
};


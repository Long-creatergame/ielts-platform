/**
 * Emotion Sync Controller
 * Synchronizes emotional state across Motivation, Adaptive Practice, and Assessment
 * Hub for emotion-based adjustments across the entire AI system
 */

const EngagementMemory = require('../../models/EngagementMemory');
const { detectEmotion, getEmotionMetadata } = require('../emotionDetector');
const { selectTone } = require('../toneSelector');

/**
 * Synchronize emotion across all AI modules
 * @param {string} userId - User ID
 * @param {object} performance - Performance data
 * @returns {Promise<object>} Synchronized emotion state
 */
async function syncEmotionAcrossModules(userId, performance) {
  try {
    // Get engagement memory
    let memory = await EngagementMemory.findOne({ userId });
    
    if (!memory) {
      memory = new EngagementMemory({
        userId,
        sentimentTrend: 'neutral',
        motivationScore: 5.0,
        lastInteraction: new Date()
      });
      await memory.save();
    }

    // Detect current emotion
    const engagementData = {
      motivationScore: memory.motivationScore,
      inactivityDays: memory.inactivityDays || 0,
      improvementTrend: memory.improvementTrend || 'flat',
      sentimentTrend: memory.sentimentTrend
    };

    const emotion = detectEmotion(performance, engagementData);
    const emotionMeta = getEmotionMetadata(emotion);
    const tone = selectTone(emotion, {
      motivationScore: memory.motivationScore,
      lastFeedbackTone: memory.lastFeedbackTone
    });

    // Update memory
    memory.lastInteraction = new Date();
    memory.emotionHistory.push({
      timestamp: new Date(),
      emotion: emotion,
      tone: tone.type,
      context: `${performance.skill || 'general'} - ${((performance.accuracy || 0) * 100).toFixed(1)}%`
    });

    // Keep only last 20 records
    if (memory.emotionHistory.length > 20) {
      memory.emotionHistory = memory.emotionHistory.slice(-20);
    }

    await memory.save();

    // Prepare sync data for other modules
    const syncData = {
      emotion: emotion,
      emotionMeta: emotionMeta,
      tone: tone,
      motivationAdjustment: getMotivationAdjustment(emotion),
      difficultyAdjustment: getDifficultyAdjustment(emotion, performance),
      messageType: getMessageType(emotion)
    };

    return {
      success: true,
      syncData: syncData,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('[Emotion Sync] Error:', error.message);
    throw error;
  }
}

/**
 * Get motivation adjustment based on emotion
 * @param {string} emotion - Detected emotion
 * @returns {number} Motivation adjustment (-0.5 to +0.5)
 */
function getMotivationAdjustment(emotion) {
  const adjustments = {
    'confident': 0.5,
    'motivated': 0.4,
    'persevering': 0.2,
    'steady': 0.1,
    'neutral': 0,
    'stagnant': -0.2,
    'frustrated': -0.3,
    'discouraged': -0.4,
    'disengaged': -0.5
  };
  return adjustments[emotion] || 0;
}

/**
 * Get difficulty adjustment suggestion based on emotion
 * @param {string} emotion - Detected emotion
 * @param {object} performance - Performance data
 * @returns {number} Difficulty adjustment suggestion
 */
function getDifficultyAdjustment(emotion, performance) {
  const { accuracy = 0.5 } = performance;

  // Don't adjust if performance is good but emotion is positive
  if ((emotion === 'confident' || emotion === 'motivated') && accuracy > 0.75) {
    return 0.3; // Increase difficulty
  }

  // Decrease difficulty if struggling
  if (emotion === 'frustrated' || emotion === 'discouraged') {
    return -0.3; // Decrease difficulty
  }

  // Maintain if steady
  if (emotion === 'steady' || emotion === 'neutral') {
    return 0;
  }

  // Slight decrease if stagnant
  if (emotion === 'stagnant') {
    return -0.1;
  }

  return 0;
}

/**
 * Get message type for different modules
 * @param {string} emotion - Detected emotion
 * @returns {string} Message type
 */
function getMessageType(emotion) {
  const types = {
    'confident': 'achievement',
    'motivated': 'encouragement',
    'persevering': 'support',
    'frustrated': 'comfort',
    'discouraged': 'reassurance',
    'disengaged': 'reactivation',
    'steady': 'guidance',
    'stagnant': 'push',
    'neutral': 'information'
  };
  return types[emotion] || 'information';
}

/**
 * Apply emotion sync to motivation service
 * @param {string} userId - User ID
 * @param {object} syncData - Sync data from emotion detection
 * @returns {Promise<boolean>} Success status
 */
async function applyToMotivation(userId, syncData) {
  try {
    // Update motivation score based on emotion
    const memory = await EngagementMemory.findOne({ userId });
    if (memory) {
      memory.motivationScore = Math.min(10, Math.max(1, 
        memory.motivationScore + syncData.motivationAdjustment
      ));
      await memory.save();
    }
    return true;
  } catch (error) {
    console.error('[Emotion Sync] Motivation update error:', error.message);
    return false;
  }
}

/**
 * Apply emotion sync to adaptive practice
 * @param {string} userId - User ID
 * @param {object} syncData - Sync data
 * @returns {Promise<object>} Adjusted practice difficulty
 */
async function applyToAdaptivePractice(userId, syncData) {
  try {
    // Get current practice session
    const PracticeSession = require('../../models/PracticeSession');
    const sessions = await PracticeSession.find({ userId }).sort({ lastUpdated: -1 });

    if (sessions.length > 0) {
      const session = sessions[0];
      const currentDifficulty = session.currentDifficulty || 5.5;
      const adjustedDifficulty = Math.min(8.5, Math.max(4.0,
        currentDifficulty + syncData.difficultyAdjustment
      ));

      // Update session if adjustment is significant
      if (Math.abs(syncData.difficultyAdjustment) > 0.1) {
        session.currentDifficulty = adjustedDifficulty;
        await session.save();
      }

      return {
        previous: currentDifficulty,
        adjusted: adjustedDifficulty,
        change: syncData.difficultyAdjustment
      };
    }

    return null;
  } catch (error) {
    console.error('[Emotion Sync] Adaptive practice update error:', error.message);
    return null;
  }
}

module.exports = {
  syncEmotionAcrossModules,
  getMotivationAdjustment,
  getDifficultyAdjustment,
  getMessageType,
  applyToMotivation,
  applyToAdaptivePractice
};

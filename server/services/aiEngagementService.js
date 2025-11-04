/**
 * AI Engagement Service
 * Main service handling emotion detection, tone selection, and AI message generation
 */

const EngagementMemory = require('../models/EngagementMemory');
const { detectEmotion, calculateImprovementTrend, calculateInactivityDays, getEmotionMetadata } = require('./emotionDetector');
const { selectTone } = require('./toneSelector');
const { generateEmotionMessage } = require('./aiEmotionMessageService');

/**
 * Handle AI emotion feedback for user
 * @param {string} userId - User ID
 * @param {string} userName - User's name
 * @param {object} performance - Performance data
 * @returns {Promise<object>} Emotion feedback result
 */
async function handleAIEmotionFeedback(userId, userName, performance) {
  try {
    // Get or create engagement memory
    let memory = await EngagementMemory.findOne({ userId });

    if (!memory) {
      memory = new EngagementMemory({
        userId,
        sentimentTrend: 'neutral',
        lastFeedbackTone: 'balanced',
        motivationScore: 5.0,
        inactivityDays: 0,
        totalSessions: 0,
        improvementTrend: 'flat',
        lastInteraction: new Date()
      });
    }

    // Calculate inactivity days
    const inactivityDays = calculateInactivityDays(memory.lastInteraction);
    memory.inactivityDays = inactivityDays;

    // Update total sessions
    memory.totalSessions += 1;

    // Prepare performance data for emotion detection
    const performanceData = {
      accuracy: performance.accuracy || 0.5,
      streak: performance.streak || 0,
      lastBandChange: performance.lastBandChange || 0,
      recentAccuracy: performance.recentAccuracy || null,
      timeSpent: performance.timeSpent || 0
    };

    // Prepare engagement data
    const engagementData = {
      motivationScore: memory.motivationScore,
      inactivityDays: memory.inactivityDays,
      improvementTrend: memory.improvementTrend,
      sentimentTrend: memory.sentimentTrend
    };

    // Detect emotion
    const emotion = detectEmotion(performanceData, engagementData);

    // Select appropriate tone
    const tone = selectTone(emotion, {
      motivationScore: memory.motivationScore,
      lastFeedbackTone: memory.lastFeedbackTone
    });

    // Prepare context for AI message
    const context = {
      accuracy: performanceData.accuracy,
      streak: performanceData.streak,
      lastBandChange: performanceData.lastBandChange,
      skill: performance.skill || 'general',
      motivationScore: memory.motivationScore,
      improvementTrend: memory.improvementTrend
    };

    // Generate AI emotion message
    const message = await generateEmotionMessage(userName, emotion, tone, context);

    // Update engagement memory
    memory.lastFeedbackTone = tone.type;
    memory.lastInteraction = new Date();
    
    // Update sentiment trend
    if (emotion === 'frustrated' || emotion === 'discouraged' || emotion === 'stagnant') {
      memory.sentimentTrend = 'negative';
    } else if (emotion === 'confident' || emotion === 'motivated' || emotion === 'persevering') {
      memory.sentimentTrend = 'positive';
    } else {
      // Keep current or default to neutral
      if (!memory.sentimentTrend) memory.sentimentTrend = 'neutral';
    }

    // Update motivation score based on emotion
    if (emotion === 'confident' || emotion === 'motivated') {
      memory.motivationScore = Math.min(10, memory.motivationScore + 0.5);
    } else if (emotion === 'frustrated' || emotion === 'discouraged') {
      memory.motivationScore = Math.max(1, memory.motivationScore - 0.3);
    } else if (emotion === 'disengaged') {
      memory.motivationScore = Math.max(1, memory.motivationScore - 0.5);
    } else if (emotion === 'persevering') {
      memory.motivationScore = Math.min(10, memory.motivationScore + 0.2);
    }

    // Update improvement trend if performance history available
    if (performance.performanceHistory && performance.performanceHistory.length > 0) {
      memory.improvementTrend = calculateImprovementTrend(performance.performanceHistory);
    }

    // Record emotion history
    memory.emotionHistory.push({
      timestamp: new Date(),
      emotion: emotion,
      tone: tone.type,
      context: `${performance.skill || 'general'} - ${(performanceData.accuracy * 100).toFixed(1)}%`
    });

    // Keep only last 20 emotion records
    if (memory.emotionHistory.length > 20) {
      memory.emotionHistory = memory.emotionHistory.slice(-20);
    }

    await memory.save();

    // Get emotion metadata for frontend
    const emotionMeta = getEmotionMetadata(emotion);

    return {
      success: true,
      emotion: emotion,
      emotionMeta: emotionMeta,
      tone: tone,
      message: message,
      engagement: {
        motivationScore: parseFloat(memory.motivationScore.toFixed(1)),
        sentimentTrend: memory.sentimentTrend,
        improvementTrend: memory.improvementTrend,
        inactivityDays: memory.inactivityDays,
        totalSessions: memory.totalSessions
      }
    };
  } catch (error) {
    console.error('[AI Engagement Service] Error:', error.message);
    throw error;
  }
}

/**
 * Get user's engagement summary
 * @param {string} userId - User ID
 * @returns {Promise<object>} Engagement summary
 */
async function getEngagementSummary(userId) {
  try {
    const memory = await EngagementMemory.findOne({ userId });

    if (!memory) {
      return {
        exists: false,
        message: 'No engagement data found'
      };
    }

    return {
      exists: true,
      sentimentTrend: memory.sentimentTrend,
      motivationScore: parseFloat(memory.motivationScore.toFixed(1)),
      improvementTrend: memory.improvementTrend,
      inactivityDays: memory.inactivityDays,
      totalSessions: memory.totalSessions,
      lastFeedbackTone: memory.lastFeedbackTone,
      lastInteraction: memory.lastInteraction,
      recentEmotions: memory.emotionHistory.slice(-5)
    };
  } catch (error) {
    console.error('[Get Engagement Summary] Error:', error.message);
    throw error;
  }
}

/**
 * Update engagement metrics (call after practice sessions)
 * @param {string} userId - User ID
 * @param {object} metrics - Session metrics
 * @returns {Promise<boolean>} Success status
 */
async function updateEngagementMetrics(userId, metrics) {
  try {
    let memory = await EngagementMemory.findOne({ userId });

    if (!memory) {
      memory = new EngagementMemory({ userId });
    }

    // Update metrics
    if (metrics.sessionDuration) {
      // Update average session duration (moving average)
      const currentAvg = memory.engagementMetrics.averageSessionDuration || 0;
      const sessionCount = memory.totalSessions || 1;
      memory.engagementMetrics.averageSessionDuration = 
        (currentAvg * (sessionCount - 1) + metrics.sessionDuration) / sessionCount;
    }

    memory.lastInteraction = new Date();
    await memory.save();

    return true;
  } catch (error) {
    console.error('[Update Engagement Metrics] Error:', error.message);
    return false;
  }
}

module.exports = {
  handleAIEmotionFeedback,
  getEngagementSummary,
  updateEngagementMetrics
};

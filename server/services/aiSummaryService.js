/**
 * AI Summary Service
 * Analyzes feedback history and generates personalized learning insights
 */

const AIFeedback = require('../models/AIFeedback');
const coachPersonality = require('../config/aiCoachPersonality');

/**
 * Generate AI summary based on user's feedback history
 */
async function generateAISummary(userId, userLevel = 'B1') {
  try {
    // Fetch recent feedback
    const feedbacks = await AIFeedback.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    if (!feedbacks || feedbacks.length === 0) {
      console.log('[AI Summary] No feedback history found for user:', userId);
      return null;
    }

    // Calculate averages across all feedback
    const averages = {};
    const count = {};

    for (const fb of feedbacks) {
      const bb = fb.bandBreakdown || {};
      
      for (const [key, value] of Object.entries(bb)) {
        if (value > 0) {
          averages[key] = (averages[key] || 0) + value;
          count[key] = (count[key] || 0) + 1;
        }
      }
    }

    // Calculate final averages
    const avgBand = {};
    for (const key in averages) {
      if (count[key] > 0) {
        avgBand[key] = parseFloat((averages[key] / count[key]).toFixed(1));
      }
    }

    // Find weakest and strongest skills
    const sortedSkills = Object.entries(avgBand).sort((a, b) => a[1] - b[1]);
    const weakestSkill = sortedSkills[0];
    const strongestSkill = sortedSkills[sortedSkills.length - 1];

    console.log('[AI Summary] Weakest:', weakestSkill[0], 'Strongest:', strongestSkill[0]);

    // Generate AI summary with Cambridge tone based on level
    const aiSummary = generateAISummaryMessage(
      strongestSkill, 
      weakestSkill, 
      avgBand, 
      userLevel
    );

    // Generate recommendation
    const recommendation = generateRecommendation(weakestSkill, userLevel);

    const summaryData = {
      avgBand,
      strongestSkill: strongestSkill[0],
      weakestSkill: weakestSkill[0],
      strongestScore: strongestSkill[1],
      weakestScore: weakestSkill[1],
      aiSummary,
      recommendation,
      feedbackCount: feedbacks.length
    };

    console.log('[AI Summary] ✅ Generated summary for user:', userId);

    return summaryData;
  } catch (error) {
    console.error('[AI Summary] Error:', error.message);
    return null;
  }
}

/**
 * Generate AI summary message with Cambridge tone
 */
function generateAISummaryMessage(strongest, weakest, avgBand, level) {
  // Use coach personality for consistent tone
  return coachPersonality.generateAISummaryMessage(strongest, weakest, avgBand, level);
}

/**
 * Generate personalized recommendation
 */
function generateRecommendation(weakestSkill, level) {
  // Use coach personality for consistent recommendations
  return coachPersonality.generateRecommendation(weakestSkill, level);
}

// Expose coach personality methods
function generateCelebration(score, improvement, skill) {
  return coachPersonality.generateCelebration(score, improvement, skill);
}

function generateWeeklySummary(testsCompleted, avgImprovement, strongestSkill, weakestSkill) {
  return coachPersonality.generateWeeklySummary(testsCompleted, avgImprovement, strongestSkill, weakestSkill);
}

function generateGreeting(userName, userLevel, lastSession) {
  return coachPersonality.generateGreeting(userName, userLevel, lastSession);
}

function generateFeedback(errorType, userLevel) {
  return coachPersonality.generateFeedback(errorType, userLevel);
}

function generateClosing(userLevel, testCount) {
  return coachPersonality.generateClosing(userLevel, testCount);
}

module.exports = {
  generateAISummary,
  generateCelebration,
  generateWeeklySummary,
  generateGreeting,
  generateFeedback,
  generateClosing
};


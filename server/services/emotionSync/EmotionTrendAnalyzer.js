/**
 * Emotion Trend Analyzer
 * Analyzes emotion patterns and trends from EngagementMemory
 */

const EngagementMemory = require('../../models/EngagementMemory');

/**
 * Analyze emotion trends over time
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze (default: 30)
 * @returns {Promise<object>} Trend analysis
 */
async function analyzeEmotionTrends(userId, days = 30) {
  try {
    const memory = await EngagementMemory.findOne({ userId });

    if (!memory || !memory.emotionHistory || memory.emotionHistory.length === 0) {
      return {
        hasData: false,
        message: 'Insufficient emotion history data'
      };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Filter recent emotions
    const recentEmotions = memory.emotionHistory.filter(
      e => new Date(e.timestamp) >= cutoffDate
    );

    if (recentEmotions.length === 0) {
      return {
        hasData: false,
        message: 'No emotion data in the specified period'
      };
    }

    // Count emotion frequencies
    const emotionCounts = {};
    recentEmotions.forEach(e => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });

    // Calculate dominant emotion
    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    // Analyze trend direction
    const positiveEmotions = ['confident', 'motivated', 'persevering', 'steady'];
    const negativeEmotions = ['frustrated', 'discouraged', 'disengaged', 'stagnant'];

    const positiveCount = recentEmotions.filter(e => positiveEmotions.includes(e.emotion)).length;
    const negativeCount = recentEmotions.filter(e => negativeEmotions.includes(e.emotion)).length;

    const trendDirection = positiveCount > negativeCount ? 'positive' :
                          negativeCount > positiveCount ? 'negative' : 'neutral';

    // Calculate stability (how consistent emotions are)
    const uniqueEmotions = Object.keys(emotionCounts).length;
    const stability = uniqueEmotions <= 2 ? 'stable' :
                     uniqueEmotions <= 4 ? 'moderate' : 'volatile';

    // Detect patterns
    const patterns = detectEmotionPatterns(recentEmotions);

    return {
      hasData: true,
      period: days,
      totalEmotions: recentEmotions.length,
      dominantEmotion: dominantEmotion,
      emotionDistribution: emotionCounts,
      trendDirection: trendDirection,
      stability: stability,
      patterns: patterns,
      sentimentTrend: memory.sentimentTrend,
      motivationScore: memory.motivationScore,
      recommendation: generateTrendRecommendation(trendDirection, dominantEmotion, stability)
    };
  } catch (error) {
    console.error('[Emotion Trend Analyzer] Error:', error.message);
    throw error;
  }
}

/**
 * Detect emotion patterns
 * @param {Array} emotions - Array of emotion history records
 * @returns {object} Detected patterns
 */
function detectEmotionPatterns(emotions) {
  const patterns = {
    improving: false,
    declining: false,
    fluctuating: false,
    consistent: false
  };

  if (emotions.length < 3) {
    return patterns;
  }

  // Check for improving pattern (more positive emotions over time)
  const firstHalf = emotions.slice(0, Math.floor(emotions.length / 2));
  const secondHalf = emotions.slice(Math.floor(emotions.length / 2));

  const positiveEmotions = ['confident', 'motivated', 'persevering', 'steady'];
  const negativeEmotions = ['frustrated', 'discouraged', 'disengaged', 'stagnant'];

  const firstPositive = firstHalf.filter(e => positiveEmotions.includes(e.emotion)).length;
  const secondPositive = secondHalf.filter(e => positiveEmotions.includes(e.emotion)).length;

  if (secondPositive > firstPositive + 2) {
    patterns.improving = true;
  } else if (firstPositive > secondPositive + 2) {
    patterns.declining = true;
  }

  // Check for fluctuation
  const uniqueEmotions = new Set(emotions.map(e => e.emotion));
  if (uniqueEmotions.size > emotions.length * 0.5) {
    patterns.fluctuating = true;
  } else if (uniqueEmotions.size <= 2) {
    patterns.consistent = true;
  }

  return patterns;
}

/**
 * Generate recommendation based on trend analysis
 * @param {string} trendDirection - Trend direction
 * @param {string} dominantEmotion - Dominant emotion
 * @param {string} stability - Stability level
 * @returns {string} Recommendation
 */
function generateTrendRecommendation(trendDirection, dominantEmotion, stability) {
  if (trendDirection === 'positive' && stability === 'stable') {
    return 'Continue current learning approach. Progress is consistent and positive.';
  }

  if (trendDirection === 'positive' && stability === 'volatile') {
    return 'Great progress overall, but consider stabilizing practice routine for better consistency.';
  }

  if (trendDirection === 'negative' && dominantEmotion === 'frustrated') {
    return 'Consider adjusting difficulty level or focusing on foundational skills to rebuild confidence.';
  }

  if (trendDirection === 'negative' && dominantEmotion === 'disengaged') {
    return 'Engagement has decreased. Try shorter, more focused practice sessions to rebuild momentum.';
  }

  if (stability === 'volatile') {
    return 'Emotions are fluctuating. Focus on establishing a consistent practice routine.';
  }

  return 'Continue monitoring progress and adjust learning approach as needed.';
}

module.exports = {
  analyzeEmotionTrends,
  detectEmotionPatterns,
  generateTrendRecommendation
};

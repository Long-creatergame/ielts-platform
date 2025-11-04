/**
 * Emotion Detector Service
 * Analyzes student emotions based on performance and engagement data
 */

/**
 * Detect emotion based on performance and engagement data
 * @param {object} performanceData - Performance metrics
 * @param {object} engagementData - Engagement memory data
 * @returns {string} Detected emotion state
 */
function detectEmotion(performanceData, engagementData) {
  const {
    accuracy = 0.5,
    streak = 0,
    lastBandChange = 0,
    recentAccuracy = null,
    timeSpent = 0
  } = performanceData;

  const {
    motivationScore = 5.0,
    inactivityDays = 0,
    improvementTrend = 'flat',
    sentimentTrend = 'neutral'
  } = engagementData || {};

  // Calculate effective accuracy (use recent if available, otherwise overall)
  const effectiveAccuracy = recentAccuracy !== null ? recentAccuracy : accuracy;

  // Disengaged: Long inactivity
  if (inactivityDays > 5) {
    return 'disengaged';
  }

  // Frustrated: Low accuracy + low motivation + declining trend
  if (effectiveAccuracy < 0.4 && motivationScore < 4 && (improvementTrend === 'downward' || lastBandChange < -0.3)) {
    return 'frustrated';
  }

  // Discouraged: Low accuracy with medium motivation (might give up soon)
  if (effectiveAccuracy < 0.5 && motivationScore < 5 && sentimentTrend === 'negative') {
    return 'discouraged';
  }

  // Confident: High accuracy + good streak + upward trend
  if (effectiveAccuracy > 0.8 && streak >= 3 && (improvementTrend === 'upward' || lastBandChange > 0.3)) {
    return 'confident';
  }

  // Motivated: Good performance with increasing motivation
  if (effectiveAccuracy > 0.7 && motivationScore >= 7 && streak >= 2) {
    return 'motivated';
  }

  // Persevering: Struggling but maintaining effort (band decreased but still trying)
  if (lastBandChange < 0 && motivationScore >= 6 && effectiveAccuracy >= 0.5) {
    return 'persevering';
  }

  // Steady: Consistent moderate performance
  if (effectiveAccuracy >= 0.5 && effectiveAccuracy <= 0.75 && motivationScore >= 5) {
    return 'steady';
  }

  // Stagnant: No progress despite practice
  if (improvementTrend === 'flat' && motivationScore < 5 && effectiveAccuracy < 0.6) {
    return 'stagnant';
  }

  // Default to neutral
  return 'neutral';
}

/**
 * Calculate improvement trend from performance history
 * @param {Array} performanceHistory - Array of recent performance records
 * @returns {string} Trend direction
 */
function calculateImprovementTrend(performanceHistory) {
  if (!performanceHistory || performanceHistory.length < 3) {
    return 'flat';
  }

  // Use last 5 records to determine trend
  const recent = performanceHistory.slice(-5);
  const accuracies = recent.map(p => p.accuracy || 0);
  
  // Calculate slope
  const n = accuracies.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = accuracies.reduce((sum, acc) => sum + acc, 0);
  const sumXY = accuracies.reduce((sum, acc, idx) => sum + acc * idx, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Threshold for trend detection
  if (slope > 0.02) return 'upward';
  if (slope < -0.02) return 'downward';
  return 'flat';
}

/**
 * Calculate inactivity days from last interaction
 * @param {Date} lastInteraction - Last interaction timestamp
 * @returns {number} Days since last interaction
 */
function calculateInactivityDays(lastInteraction) {
  if (!lastInteraction) return 0;
  
  const now = new Date();
  const last = new Date(lastInteraction);
  const diffTime = Math.abs(now - last);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get emotion description for UI display
 * @param {string} emotion - Emotion state
 * @returns {object} Emotion metadata
 */
function getEmotionMetadata(emotion) {
  const metadata = {
    frustrated: {
      icon: '😓',
      label: 'Frustrated',
      color: 'red',
      description: 'Feeling overwhelmed or stuck'
    },
    discouraged: {
      icon: '😔',
      label: 'Discouraged',
      color: 'orange',
      description: 'Losing confidence'
    },
    disengaged: {
      icon: '😴',
      label: 'Disengaged',
      color: 'gray',
      description: 'Been away for a while'
    },
    confident: {
      icon: '😊',
      label: 'Confident',
      color: 'green',
      description: 'Performing well!'
    },
    motivated: {
      icon: '🚀',
      label: 'Motivated',
      color: 'blue',
      description: 'Eager to improve'
    },
    persevering: {
      icon: '💪',
      label: 'Persevering',
      color: 'yellow',
      description: 'Staying strong despite challenges'
    },
    steady: {
      icon: '📊',
      label: 'Steady',
      color: 'indigo',
      description: 'Consistent progress'
    },
    stagnant: {
      icon: '⏸️',
      label: 'Stagnant',
      color: 'gray',
      description: 'Not seeing much progress'
    },
    neutral: {
      icon: '😐',
      label: 'Neutral',
      color: 'gray',
      description: 'Balanced state'
    }
  };

  return metadata[emotion] || metadata.neutral;
}

module.exports = {
  detectEmotion,
  calculateImprovementTrend,
  calculateInactivityDays,
  getEmotionMetadata
};

/**
 * Difficulty Adjuster Service
 * Calculates next difficulty level based on user performance
 * Adjusts in real-time based on accuracy, streak, and speed
 */

/**
 * Adjust difficulty based on session performance
 * @param {object} session - Practice session object
 * @param {object} performance - Current performance data
 * @returns {number} New difficulty (band score)
 */
function adjustDifficulty(session, performance = {}) {
  const {
    correctAnswers = 0,
    totalQuestions = 0,
    streak = 0,
    currentDifficulty = 5.5
  } = session;

  // Calculate accuracy
  const accuracy = totalQuestions > 0 
    ? correctAnswers / totalQuestions 
    : 0.5; // Default to 50% if no questions yet

  // Streak factor: reward consecutive correct answers
  const streakFactor = streak >= 3 ? 0.1 : streak >= 5 ? 0.2 : 0;

  // Performance-based adjustment
  let newDifficulty = currentDifficulty;

  if (accuracy > 0.8) {
    // High accuracy: increase difficulty
    newDifficulty += 0.3 + streakFactor;
  } else if (accuracy > 0.65) {
    // Good accuracy: slight increase
    newDifficulty += 0.1 + (streakFactor * 0.5);
  } else if (accuracy < 0.5) {
    // Low accuracy: decrease difficulty
    newDifficulty -= 0.3;
  } else {
    // Moderate accuracy (50-65%): maintain or slight decrease
    newDifficulty -= 0.1;
  }

  // Clamp difficulty to Cambridge band range (4.0 - 8.5)
  // This ensures we stay within realistic IELTS band scores
  newDifficulty = Math.min(Math.max(newDifficulty, 4.0), 8.5);

  // Round to nearest 0.5 (standard IELTS band increments)
  return Math.round(newDifficulty * 2) / 2;
}

/**
 * Calculate difficulty adjustment based on recent performance
 * @param {Array} recentPerformance - Array of recent performance records
 * @returns {number} Suggested difficulty adjustment
 */
function calculateDifficultyFromHistory(recentPerformance) {
  if (!recentPerformance || recentPerformance.length === 0) {
    return 5.5; // Default starting difficulty
  }

  // Use last 5 performance records
  const recent = recentPerformance.slice(-5);
  const avgAccuracy = recent.reduce((sum, p) => sum + (p.accuracy || 0), 0) / recent.length;
  const avgDifficulty = recent.reduce((sum, p) => sum + (p.difficulty || 5.5), 0) / recent.length;

  // Adjust based on average performance
  if (avgAccuracy > 0.75) {
    return Math.min(avgDifficulty + 0.5, 8.5);
  } else if (avgAccuracy < 0.5) {
    return Math.max(avgDifficulty - 0.5, 4.0);
  }

  return avgDifficulty;
}

/**
 * Get difficulty level description
 * @param {number} difficulty - Difficulty band score
 * @returns {string} Difficulty description
 */
function getDifficultyLabel(difficulty) {
  if (difficulty >= 8.0) return 'Advanced';
  if (difficulty >= 7.0) return 'Upper-Intermediate';
  if (difficulty >= 6.0) return 'Intermediate';
  if (difficulty >= 5.0) return 'Lower-Intermediate';
  return 'Elementary';
}

/**
 * Check if difficulty should increase based on streak
 * @param {number} streak - Current streak count
 * @returns {boolean} True if should increase
 */
function shouldIncreaseByStreak(streak) {
  return streak >= 3;
}

module.exports = {
  adjustDifficulty,
  calculateDifficultyFromHistory,
  getDifficultyLabel,
  shouldIncreaseByStreak
};

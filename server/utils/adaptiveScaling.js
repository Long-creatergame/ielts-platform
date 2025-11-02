/**
 * Adaptive Test Scaling Utility
 * Adjusts test difficulty based on user performance and target band
 */

const adaptiveScaling = {
  A1: { next: "A2", downgrade: "A1", step: 0 },
  A2: { next: "B1", downgrade: "A1", step: 0.5 },
  B1: { next: "B2", downgrade: "A2", step: 1 },
  B2: { next: "C1", downgrade: "B1", step: 1.5 },
  C1: { next: "C2", downgrade: "B2", step: 2 },
  C2: { next: "C2", downgrade: "C1", step: 2.5 }
};

/**
 * Adjust user level based on performance
 * @param {string} currentLevel - User's current CEFR level (A1-C2)
 * @param {number} lastScore - Last test band score
 * @param {number} targetBand - User's target band
 * @returns {string} Adjusted level
 */
function adjustLevel(currentLevel = "B1", lastScore, targetBand = 6.5) {
  const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const currentIndex = levelOrder.indexOf(currentLevel);
  
  // Fallback to B1 if level not found
  if (currentIndex === -1) {
    console.warn(`[AdaptiveScaling] Unknown level ${currentLevel}, defaulting to B1`);
    return "B1";
  }
  
  let newIndex = currentIndex;
  
  // If score exceeds target significantly → increase difficulty
  if (lastScore >= targetBand + 0.5 && currentIndex < 5) {
    newIndex = currentIndex + 1;
    console.log(`[AdaptiveScaling] Upgrading: ${currentLevel} → ${levelOrder[newIndex]} (score: ${lastScore}, target: ${targetBand})`);
  }
  // If score is much lower than target → decrease difficulty
  else if (lastScore < targetBand - 1 && currentIndex > 0) {
    newIndex = currentIndex - 1;
    console.log(`[AdaptiveScaling] Downgrading: ${currentLevel} → ${levelOrder[newIndex]} (score: ${lastScore}, target: ${targetBand})`);
  }
  // Keep same level if within acceptable range
  else {
    console.log(`[AdaptiveScaling] Maintaining: ${currentLevel} (score: ${lastScore}, target: ${targetBand})`);
  }
  
  return levelOrder[newIndex];
}

/**
 * Get scaling configuration for a level
 * @param {string} level - CEFR level
 * @returns {object|null} Scaling config or null
 */
function getScalingConfig(level = "B1") {
  return adaptiveScaling[level] || adaptiveScaling["B1"];
}

/**
 * Calculate next appropriate level based on performance history
 * @param {Array} performanceHistory - Array of past test results
 * @param {string} currentLevel - Current level
 * @param {number} targetBand - Target band
 * @returns {string} Next level
 */
function calculateNextLevel(performanceHistory = [], currentLevel = "B1", targetBand = 6.5) {
  if (!performanceHistory || performanceHistory.length === 0) {
    console.log(`[AdaptiveScaling] No history, using current level: ${currentLevel}`);
    return currentLevel;
  }
  
  // Get average of last 3 tests or last test if fewer
  const recentTests = performanceHistory.slice(-3);
  const averageScore = recentTests.reduce((sum, test) => sum + (test.band || 0), 0) / recentTests.length;
  
  console.log(`[AdaptiveScaling] Average of ${recentTests.length} recent tests: ${averageScore.toFixed(1)}`);
  
  return adjustLevel(currentLevel, averageScore, targetBand);
}

module.exports = {
  adaptiveScaling,
  adjustLevel,
  getScalingConfig,
  calculateNextLevel
};


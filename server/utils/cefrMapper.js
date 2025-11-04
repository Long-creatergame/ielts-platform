/**
 * CEFR Mapper Utility
 * Maps IELTS Band Scores (1-9) to CEFR Levels (A1-C2)
 * Based on official Cambridge alignment
 */

/**
 * Map IELTS band score to CEFR level
 * @param {number} band - IELTS band score (0-9)
 * @returns {string} CEFR level (A1, A2, B1, B2, C1, C2)
 */
function mapBandToCEFR(band) {
  const numericBand = parseFloat(band);
  
  if (isNaN(numericBand)) {
    return 'A1'; // Default for invalid input
  }

  if (numericBand < 3.0) {
    return 'A1';
  } else if (numericBand < 4.0) {
    return 'A2';
  } else if (numericBand < 5.0) {
    return 'B1';
  } else if (numericBand < 6.5) {
    return 'B2';
  } else if (numericBand < 8.0) {
    return 'C1';
  } else {
    return 'C2';
  }
}

/**
 * Map CEFR level to minimum band score
 * @param {string} cefr - CEFR level
 * @returns {number} Minimum IELTS band score
 */
function mapCEFRToMinBand(cefr) {
  const levelMap = {
    'A1': 0,
    'A2': 3.0,
    'B1': 4.0,
    'B2': 5.0,
    'C1': 6.5,
    'C2': 8.0
  };
  
  return levelMap[cefr?.toUpperCase()] || 0;
}

/**
 * Map CEFR level to target band range
 * @param {string} cefr - CEFR level
 * @returns {{min: number, max: number}} Band range
 */
function getCEFRBandRange(cefr) {
  const rangeMap = {
    'A1': { min: 0, max: 3.0 },
    'A2': { min: 3.0, max: 4.0 },
    'B1': { min: 4.0, max: 5.0 },
    'B2': { min: 5.0, max: 6.5 },
    'C1': { min: 6.5, max: 8.0 },
    'C2': { min: 8.0, max: 9.0 }
  };
  
  return rangeMap[cefr?.toUpperCase()] || { min: 0, max: 9.0 };
}

/**
 * Get descriptive label for CEFR level
 * @param {string} cefr - CEFR level
 * @returns {string} Descriptive label
 */
function getCEFRLabel(cefr) {
  const labels = {
    'A1': 'Beginner',
    'A2': 'Elementary',
    'B1': 'Intermediate',
    'B2': 'Upper-Intermediate',
    'C1': 'Advanced',
    'C2': 'Proficient'
  };
  
  return labels[cefr?.toUpperCase()] || 'Unknown';
}

/**
 * Check if band score matches target CEFR level
 * @param {number} band - Current band score
 * @param {string} targetCEFR - Target CEFR level
 * @returns {boolean} True if band meets target
 */
function meetsCEFRTarget(band, targetCEFR) {
  const numericBand = parseFloat(band);
  const minBand = mapCEFRToMinBand(targetCEFR);
  return numericBand >= minBand;
}

/**
 * Get next CEFR level to aim for
 * @param {string} currentCEFR - Current CEFR level
 * @returns {string} Next CEFR level
 */
function getNextCEFRLevel(currentCEFR) {
  const progression = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = progression.indexOf(currentCEFR?.toUpperCase());
  
  if (currentIndex === -1 || currentIndex === progression.length - 1) {
    return null; // Already at highest level or invalid
  }
  
  return progression[currentIndex + 1];
}

module.exports = {
  mapBandToCEFR,
  mapCEFRToMinBand,
  getCEFRBandRange,
  getCEFRLabel,
  meetsCEFRTarget,
  getNextCEFRLevel
};

/**
 * Level Mapper Utility
 * Converts between numeric band scores (0-9) and CEFR levels (A1-C2)
 * Maps difficulty and generates appropriate test content
 */

/**
 * Convert numeric IELTS band score to CEFR level
 * @param {number} bandScore - IELTS band score (0-9)
 * @returns {Object} CEFR level information
 */
const numericToCEFR = (bandScore) => {
  if (!bandScore || isNaN(bandScore) || bandScore < 0 || bandScore > 9) {
    return { 
      level: 'B1', 
      label: 'Intermediate',
      descriptor: 'Can understand main points on familiar matters',
      approximateBand: 5.5
    };
  }

  // Official IELTS to CEFR mapping
  if (bandScore >= 8.5) {
    return { 
      level: 'C2', 
      label: 'Proficient',
      descriptor: 'Can understand with ease virtually everything',
      approximateBand: 8.5,
      fluency: 'Near-native',
      accuracy: 'Highly accurate',
      complexity: 'Very complex'
    };
  } else if (bandScore >= 7.5) {
    return { 
      level: 'C1', 
      label: 'Advanced',
      descriptor: 'Can understand a wide range of demanding texts',
      approximateBand: 7.5,
      fluency: 'Fluent',
      accuracy: 'Accurate',
      complexity: 'Complex'
    };
  } else if (bandScore >= 6.5) {
    return { 
      level: 'B2', 
      label: 'Upper Intermediate',
      descriptor: 'Can understand main ideas of complex text',
      approximateBand: 6.5,
      fluency: 'Fairly fluent',
      accuracy: 'Generally accurate',
      complexity: 'Moderately complex'
    };
  } else if (bandScore >= 5.5) {
    return { 
      level: 'B1', 
      label: 'Intermediate',
      descriptor: 'Can understand main points on familiar matters',
      approximateBand: 5.5,
      fluency: 'Basic fluency',
      accuracy: 'Some inaccuracy',
      complexity: 'Simple to intermediate'
    };
  } else if (bandScore >= 4.5) {
    return { 
      level: 'A2', 
      label: 'Elementary',
      descriptor: 'Can understand sentences and frequently used expressions',
      approximateBand: 4.5,
      fluency: 'Limited fluency',
      accuracy: 'Frequent errors',
      complexity: 'Simple'
    };
  } else {
    return { 
      level: 'A1', 
      label: 'Beginner',
      descriptor: 'Can understand basic phrases and expressions',
      approximateBand: 3.5,
      fluency: 'Very limited',
      accuracy: 'Many errors',
      complexity: 'Very simple'
    };
  }
};

/**
 * Convert CEFR level to approximate IELTS band score
 * @param {string} cefrLevel - CEFR level (A1-C2)
 * @returns {Object} IELTS band information
 */
const cefrToNumeric = (cefrLevel) => {
  if (!cefrLevel) {
    return { bandScore: 5.5, range: '5.0-6.0' };
  }

  const upperLevel = cefrLevel.toUpperCase();
  const mappings = {
    'A1': { 
      bandScore: 3.5, 
      range: '3.0-4.0',
      description: 'Basic user - beginner level'
    },
    'A2': { 
      bandScore: 4.5, 
      range: '4.0-5.0',
      description: 'Basic user - elementary level'
    },
    'B1': { 
      bandScore: 5.5, 
      range: '5.0-6.0',
      description: 'Independent user - intermediate level'
    },
    'B2': { 
      bandScore: 6.5, 
      range: '6.0-7.0',
      description: 'Independent user - upper intermediate level'
    },
    'C1': { 
      bandScore: 7.5, 
      range: '7.0-8.0',
      description: 'Proficient user - advanced level'
    },
    'C2': { 
      bandScore: 8.5, 
      range: '8.0-9.0',
      description: 'Proficient user - proficient level'
    }
  };

  return mappings[upperLevel] || mappings['B1'];
};

/**
 * Convert any band representation to standardized format
 * @param {string|number} band - Band in any format (A1, B2, 6.5, "7", etc.)
 * @returns {Object} Normalized band information
 */
const normalizeBand = (band) => {
  if (!band) {
    return { cefr: 'B1', numeric: 5.5 };
  }

  const bandStr = String(band).toUpperCase();
  
  // Check if it's already a CEFR level (A1-C2)
  if (/^[A-C][1-2]$/.test(bandStr)) {
    const numericInfo = cefrToNumeric(bandStr);
    return {
      cefr: bandStr,
      numeric: numericInfo.bandScore,
      range: numericInfo.range,
      display: `${bandStr} (${numericInfo.bandScore})`
    };
  }
  
  // Otherwise, try to parse as a number
  const numericBand = parseFloat(band);
  if (!isNaN(numericBand)) {
    const cefrInfo = numericToCEFR(numericBand);
    return {
      cefr: cefrInfo.level,
      numeric: numericBand,
      display: `${numericBand} (${cefrInfo.level})`,
      ...cefrInfo
    };
  }
  
  // Fallback
  return { cefr: 'B1', numeric: 5.5, display: '5.5 (B1)' };
};

/**
 * Get difficulty parameters for a given level
 * @param {string|number} level - Level in any format
 * @returns {Object} Difficulty parameters
 */
const getDifficultyParams = (level) => {
  const normalized = normalizeBand(level);
  
  const params = {
    'A1': {
      vocabularyRange: 1000,
      sentenceComplexity: 'simple',
      topicFamiliarity: 'high',
      abstractConcepts: 'none',
      distractorLevel: 'minimal'
    },
    'A2': {
      vocabularyRange: 2000,
      sentenceComplexity: 'simple',
      topicFamiliarity: 'high',
      abstractConcepts: 'minimal',
      distractorLevel: 'low'
    },
    'B1': {
      vocabularyRange: 3500,
      sentenceComplexity: 'intermediate',
      topicFamiliarity: 'moderate',
      abstractConcepts: 'some',
      distractorLevel: 'moderate'
    },
    'B2': {
      vocabularyRange: 5000,
      sentenceComplexity: 'complex',
      topicFamiliarity: 'varied',
      abstractConcepts: 'moderate',
      distractorLevel: 'high'
    },
    'C1': {
      vocabularyRange: 7000,
      sentenceComplexity: 'very complex',
      topicFamiliarity: 'low',
      abstractConcepts: 'many',
      distractorLevel: 'very high'
    },
    'C2': {
      vocabularyRange: 9000,
      sentenceComplexity: 'extremely complex',
      topicFamiliarity: 'minimal',
      abstractConcepts: 'sophisticated',
      distractorLevel: 'sophisticated'
    }
  };

  return params[normalized.cefr] || params['B1'];
};

/**
 * Check if a band score represents a "passing" level for IELTS
 * @param {string|number} band - Band in any format
 * @returns {Object} Passing status and requirements
 */
const isPassingLevel = (band) => {
  const normalized = normalizeBand(band);
  
  return {
    isPass: normalized.numeric >= 5.5,
    level: normalized.cefr,
    numeric: normalized.numeric,
    status: normalized.numeric >= 5.5 ? 'Passing' : 'Below minimum',
    minimum: '5.5 (B1)',
    description: normalized.numeric >= 5.5 
      ? 'Meets minimum IELTS requirements' 
      : 'Below typical IELTS minimum requirements'
  };
};

/**
 * Get appropriate test duration for a given level and skill
 * @param {string|number} level - Level in any format
 * @param {string} skill - Test skill (reading, listening, writing, speaking)
 * @returns {number} Duration in minutes
 */
const getTestDuration = (level, skill) => {
  const normalized = normalizeBand(level);
  
  // Official IELTS timings (same for all levels)
  const officialTimings = {
    reading: 60,
    listening: 30,
    writing: 60,
    speaking: 11
  };
  
  // Shorter durations for lower levels
  const adjustedTimings = {
    'A1': {
      reading: 15,
      listening: 15,
      writing: 15,
      speaking: 7
    },
    'A2': {
      reading: 25,
      listening: 20,
      writing: 25,
      speaking: 9
    }
  };
  
  return adjustedTimings[normalized.cefr]?.[skill] || officialTimings[skill];
};

module.exports = {
  numericToCEFR,
  cefrToNumeric,
  normalizeBand,
  getDifficultyParams,
  isPassingLevel,
  getTestDuration
};

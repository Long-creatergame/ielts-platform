/**
 * AI Assessment Service
 * Unified Cambridge Assessment & Band Calculation
 * Evaluates test results and calculates official IELTS bands
 */

const { getBandFromScore, calculateWritingBand, calculateSpeakingBand, calculateOverallBand } = require('../utils/bandCalculator');
const { mapBandToCEFR } = require('../utils/cefrMapper');

/**
 * Evaluate test result and calculate bands for all skills
 * @param {object} testResult - Test result object with skill data
 * @returns {object} Assessment with bands and CEFR level
 */
async function evaluateTest(testResult) {
  try {
    const { skillScores, skillBands, aiFeedback } = testResult;
    
    // Initialize bands object
    const bands = {
      reading: 0,
      listening: 0,
      writing: 0,
      speaking: 0
    };

    // Calculate Reading band
    if (skillScores?.reading || skillBands?.reading) {
      if (typeof skillScores?.reading === 'object' && skillScores.reading.correct !== undefined) {
        // From skillScores (correct/total format)
        bands.reading = getBandFromScore(
          skillScores.reading.correct,
          skillScores.reading.total || 40
        );
      } else if (typeof skillBands?.reading === 'number') {
        // From skillBands (already calculated)
        bands.reading = parseFloat(skillBands.reading);
      }
    }

    // Calculate Listening band
    if (skillScores?.listening || skillBands?.listening) {
      if (typeof skillScores?.listening === 'object' && skillScores.listening.correct !== undefined) {
        bands.listening = getBandFromScore(
          skillScores.listening.correct,
          skillScores.listening.total || 40
        );
      } else if (typeof skillBands?.listening === 'number') {
        bands.listening = parseFloat(skillBands.listening);
      }
    }

    // Calculate Writing band from AI feedback
    if (aiFeedback?.writing || skillBands?.writing) {
      if (aiFeedback?.writing) {
        bands.writing = calculateWritingBand(aiFeedback.writing);
      } else if (typeof skillBands?.writing === 'number') {
        bands.writing = parseFloat(skillBands.writing);
      }
    }

    // Calculate Speaking band from AI feedback
    if (aiFeedback?.speaking || skillBands?.speaking) {
      if (aiFeedback?.speaking) {
        bands.speaking = calculateSpeakingBand(aiFeedback.speaking);
      } else if (typeof skillBands?.speaking === 'number') {
        bands.speaking = parseFloat(skillBands.speaking);
      }
    }

    // Calculate overall band
    const overall = calculateOverallBand(bands);

    // Map to CEFR level
    const cefr = mapBandToCEFR(overall);

    return {
      bands,
      overall: parseFloat(overall.toFixed(1)),
      cefr,
      evaluatedAt: new Date()
    };
  } catch (error) {
    console.error('[AI Assessment] Error evaluating test:', error.message);
    // Return default assessment on error
    return {
      bands: { reading: 0, listening: 0, writing: 0, speaking: 0 },
      overall: 0,
      cefr: 'A1',
      evaluatedAt: new Date(),
      error: error.message
    };
  }
}

/**
 * Detect weak skills from assessment
 * @param {object} assessment - Assessment result
 * @returns {Array} Array of weak skill names
 */
function detectWeakSkills(assessment) {
  const { bands, overall } = assessment;
  const weakSkills = [];
  const threshold = overall - 0.5; // Skills below overall - 0.5 are considered weak

  Object.entries(bands).forEach(([skill, band]) => {
    if (band < threshold && band > 0) {
      weakSkills.push(skill);
    }
  });

  return weakSkills;
}

/**
 * Get skill focus areas based on weak skills
 * @param {string} skill - Skill name
 * @returns {string} Focus area description
 */
function getSkillFocus(skill) {
  const focusMap = {
    'reading': 'Reading Comprehension & Speed',
    'listening': 'Listening Accuracy & Note-taking',
    'writing': 'Task Achievement & Coherence',
    'speaking': 'Fluency & Pronunciation'
  };
  
  return focusMap[skill] || 'General Improvement';
}

/**
 * Validate assessment result
 * @param {object} assessment - Assessment result
 * @returns {boolean} True if valid
 */
function isValidAssessment(assessment) {
  if (!assessment || typeof assessment !== 'object') {
    return false;
  }

  const { bands, overall, cefr } = assessment;
  
  if (!bands || typeof bands !== 'object') {
    return false;
  }

  if (typeof overall !== 'number' || overall < 0 || overall > 9) {
    return false;
  }

  if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(cefr)) {
    return false;
  }

  return true;
}

module.exports = {
  evaluateTest,
  detectWeakSkills,
  getSkillFocus,
  isValidAssessment
};

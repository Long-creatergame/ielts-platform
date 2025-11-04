/**
 * Generate Authentic Cambridge Test
 * Uses authentic Cambridge IELTS blueprint (no CEFR level splitting)
 */

const { getAuthenticBlueprint } = require('../services/getCambridgeAuthenticBlueprint');

/**
 * Generate authentic Cambridge test structure
 * @param {string} skill - Skill name (reading, listening, writing, speaking)
 * @param {string} mode - Mode (academic, general)
 * @returns {object} Authentic Cambridge test structure
 */
async function generateAuthenticTest(skill, mode = "academic") {
  try {
    const blueprint = getAuthenticBlueprint(skill, mode);
    
    return {
      skill,
      mode,
      formType: "Cambridge-Authentic",
      ...blueprint,
      version: "2.13.F.3",
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('[GenerateAuthenticTest] Error:', error.message);
    // Return default structure on error
    return {
      skill,
      mode,
      formType: "Cambridge-Authentic",
      totalQuestions: skill === 'reading' || skill === 'listening' ? 40 : undefined,
      duration: skill === 'reading' ? 60 : skill === 'listening' ? 30 : skill === 'writing' ? 60 : 14,
      structure: [],
      version: "2.13.F.3",
      error: error.message
    };
  }
}

/**
 * Validate authentic test structure
 * @param {object} test - Test structure to validate
 * @returns {boolean} True if valid
 */
function isValidAuthenticTest(test) {
  if (!test || typeof test !== 'object') return false;
  if (test.formType !== "Cambridge-Authentic") return false;
  if (!test.skill || !test.mode) return false;
  
  // Validate skill-specific requirements
  if (test.skill === 'reading' || test.skill === 'listening') {
    return test.totalQuestions === 40 && test.duration > 0;
  }
  
  if (test.skill === 'writing') {
    return test.tasks && Array.isArray(test.tasks) && test.tasks.length === 2;
  }
  
  if (test.skill === 'speaking') {
    return test.structure && Array.isArray(test.structure) && test.structure.length === 3;
  }
  
  return true;
}

module.exports = {
  generateAuthenticTest,
  isValidAuthenticTest
};

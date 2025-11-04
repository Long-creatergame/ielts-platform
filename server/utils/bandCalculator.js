/**
 * Band Calculator Utility
 * Official Cambridge IELTS band score calculations
 */

/**
 * Convert correct answers to IELTS band score (Reading/Listening)
 * Based on official Cambridge IELTS conversion table
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions (default: 40)
 * @returns {number} Band score (0-9)
 */
function getBandFromScore(correct, total = 40) {
  const numericCorrect = parseInt(correct) || 0;
  const numericTotal = parseInt(total) || 40;
  const percentage = (numericCorrect / numericTotal) * 100;

  // Official IELTS Reading/Listening band conversion
  // Approximate conversion (actual tables vary slightly by test version)
  if (percentage >= 95) return 9.0;
  if (percentage >= 90) return 8.5;
  if (percentage >= 85) return 8.0;
  if (percentage >= 80) return 7.5;
  if (percentage >= 75) return 7.0;
  if (percentage >= 70) return 6.5;
  if (percentage >= 65) return 6.0;
  if (percentage >= 60) return 5.5;
  if (percentage >= 55) return 5.0;
  if (percentage >= 50) return 4.5;
  if (percentage >= 40) return 4.0;
  if (percentage >= 35) return 3.5;
  if (percentage >= 30) return 3.0;
  if (percentage >= 25) return 2.5;
  if (percentage >= 20) return 2.0;
  if (percentage >= 15) return 1.5;
  if (percentage >= 10) return 1.0;
  return 0.0;
}

/**
 * Calculate Writing band from AI feedback
 * Based on 4 criteria: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy
 * @param {object} feedback - AI feedback object with sub-scores
 * @returns {number} Band score (0-9)
 */
function calculateWritingBand(feedback) {
  if (!feedback || typeof feedback !== 'object') {
    return 5.0; // Default mid-band
  }

  // Extract sub-scores from feedback
  const taskAchievement = parseFloat(feedback.taskAchievement || feedback.task || feedback.taskResponse) || 5.0;
  const coherence = parseFloat(feedback.coherence || feedback.coherenceCohesion) || 5.0;
  const lexical = parseFloat(feedback.lexical || feedback.lexicalResource || feedback.vocabulary) || 5.0;
  const grammar = parseFloat(feedback.grammar || feedback.grammaticalRange || feedback.grammaticalAccuracy) || 5.0;

  // Average of 4 criteria (official IELTS Writing scoring)
  const averageBand = (taskAchievement + coherence + lexical + grammar) / 4;

  // Round to nearest 0.5
  return Math.round(averageBand * 2) / 2;
}

/**
 * Calculate Speaking band from AI feedback
 * Based on 4 criteria: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation
 * @param {object} feedback - AI feedback object with sub-scores
 * @returns {number} Band score (0-9)
 */
function calculateSpeakingBand(feedback) {
  if (!feedback || typeof feedback !== 'object') {
    return 5.0; // Default mid-band
  }

  // Extract sub-scores from feedback
  const fluency = parseFloat(feedback.fluency || feedback.fluencyCoherence) || 5.0;
  const lexical = parseFloat(feedback.lexical || feedback.lexicalResource || feedback.vocabulary) || 5.0;
  const grammar = parseFloat(feedback.grammar || feedback.grammaticalRange || feedback.grammaticalAccuracy) || 5.0;
  const pronunciation = parseFloat(feedback.pronunciation) || 5.0;

  // Average of 4 criteria (official IELTS Speaking scoring)
  const averageBand = (fluency + lexical + grammar + pronunciation) / 4;

  // Round to nearest 0.5
  return Math.round(averageBand * 2) / 2;
}

/**
 * Calculate overall band from skill bands
 * @param {object} skillBands - Object with reading, listening, writing, speaking bands
 * @returns {number} Overall band score
 */
function calculateOverallBand(skillBands) {
  if (!skillBands || typeof skillBands !== 'object') {
    return 0;
  }

  const reading = parseFloat(skillBands.reading) || 0;
  const listening = parseFloat(skillBands.listening) || 0;
  const writing = parseFloat(skillBands.writing) || 0;
  const speaking = parseFloat(skillBands.speaking) || 0;

  const sum = reading + listening + writing + speaking;
  const count = [reading, listening, writing, speaking].filter(b => b > 0).length;

  if (count === 0) return 0;

  const average = sum / count;

  // Round to nearest 0.5
  return Math.round(average * 2) / 2;
}

/**
 * Validate band score range
 * @param {number} band - Band score to validate
 * @returns {boolean} True if valid (0-9)
 */
function isValidBand(band) {
  const numericBand = parseFloat(band);
  return !isNaN(numericBand) && numericBand >= 0 && numericBand <= 9;
}

module.exports = {
  getBandFromScore,
  calculateWritingBand,
  calculateSpeakingBand,
  calculateOverallBand,
  isValidBand
};

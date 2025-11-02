/**
 * AI Level Calibration Configuration
 * Defines tone, vocabulary, structure, and feedback depth for each CEFR level
 * Ensures AI feedback matches learner proficiency
 */

const aiCalibration = {
  A1: {
    tone: "very simple and supportive",
    vocab: "basic everyday words",
    structure: "1-2 short sentences per point",
    feedbackDepth: "surface-level errors only",
    examples: "simple phrases, avoid complex grammar",
    encouragement: "You're making good progress!"
  },
  A2: {
    tone: "friendly and encouraging",
    vocab: "simple, slightly extended beyond daily use",
    structure: "brief paragraphs with basic connectors",
    feedbackDepth: "grammar + task completion",
    examples: "show short sample sentences",
    encouragement: "Well done! Keep practicing."
  },
  B1: {
    tone: "balanced and neutral",
    vocab: "intermediate IELTS-level",
    structure: "clear paragraphs with topic sentences",
    feedbackDepth: "grammar, coherence, task response",
    examples: "use common IELTS examples",
    encouragement: "Good effort. Focus on improving coherence."
  },
  B2: {
    tone: "academic but encouraging",
    vocab: "upper-intermediate words and collocations",
    structure: "structured 3-4 sentence paragraphs",
    feedbackDepth: "lexical choice, cohesion, grammar range",
    examples: "demonstrate proper linking phrases",
    encouragement: "Solid work. Expand your lexical range."
  },
  C1: {
    tone: "formal, precise, constructive",
    vocab: "academic and idiomatic language",
    structure: "organized multi-paragraph feedback",
    feedbackDepth: "detailed lexical and stylistic advice",
    examples: "advanced IELTS-style examples",
    encouragement: "Excellent work. Refine your stylistic choices."
  },
  C2: {
    tone: "professional and expert",
    vocab: "advanced academic vocabulary",
    structure: "highly detailed with analytical depth",
    feedbackDepth: "nuanced stylistic and logical feedback",
    examples: "include refined model phrases",
    encouragement: "Exceptional performance. Enhance precision."
  }
};

/**
 * Get calibration config for a level (fallback to B1)
 */
function getCalibration(level = "B1") {
  return aiCalibration[level] || aiCalibration["B1"];
}

/**
 * Build level-aware feedback instruction
 */
function getFeedbackInstructions(level, skill) {
  const cal = getCalibration(level);
  
  const baseInstructions = skill === 'writing' 
    ? 'IELTS Writing Assessment Criteria:\n1. Task Response (25%)\n2. Coherence and Cohesion (25%)\n3. Lexical Resource (25%)\n4. Grammar Range and Accuracy (25%)'
    : 'IELTS Speaking Assessment Criteria:\n1. Fluency and Coherence (25%)\n2. Lexical Resource (25%)\n3. Grammar Range and Accuracy (25%)\n4. Pronunciation (25%)';
  
  return `
Feedback Style for ${level} Student:
- Tone: ${cal.tone}
- Vocabulary: ${cal.vocab}
- Structure: ${cal.structure}
- Feedback Depth: ${cal.feedbackDepth}
- Examples: ${cal.examples}

${baseInstructions}

Important: Adjust your feedback language to match ${level} level proficiency. ${cal.encouragement}
`.trim();
}

module.exports = {
  aiCalibration,
  getCalibration,
  getFeedbackInstructions
};


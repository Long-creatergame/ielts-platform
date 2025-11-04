/**
 * Tone Selector Service
 * Selects appropriate response tone based on detected emotion
 */

/**
 * Select tone based on emotion state
 * @param {string} emotion - Detected emotion
 * @param {object} context - Additional context (optional)
 * @returns {object} Tone configuration
 */
function selectTone(emotion, context = {}) {
  const {
    motivationScore = 5.0,
    lastFeedbackTone = 'balanced'
  } = context;

  const tones = {
    frustrated: {
      type: 'supportive',
      style: 'gentle encouragement',
      warmth: 0.9,
      directness: 0.3,
      positivity: 0.7,
      description: 'Gentle, comforting, understanding'
    },
    discouraged: {
      type: 'uplifting',
      style: 'hopeful reassurance',
      warmth: 0.8,
      directness: 0.4,
      positivity: 0.8,
      description: 'Encouraging, hopeful, supportive'
    },
    disengaged: {
      type: 'motivating',
      style: 'friendly reactivation',
      warmth: 0.7,
      directness: 0.6,
      positivity: 0.9,
      description: 'Friendly, inviting, energizing'
    },
    confident: {
      type: 'professional',
      style: 'growth-focused',
      warmth: 0.6,
      directness: 0.7,
      positivity: 0.8,
      description: 'Professional, constructive, forward-looking'
    },
    motivated: {
      type: 'energetic',
      style: 'challenge-oriented',
      warmth: 0.7,
      directness: 0.8,
      positivity: 0.9,
      description: 'Energetic, challenging, inspiring'
    },
    persevering: {
      type: 'encouraging',
      style: 'acknowledging effort',
      warmth: 0.8,
      directness: 0.5,
      positivity: 0.75,
      description: 'Empathetic, reinforcing, validating'
    },
    steady: {
      type: 'balanced',
      style: 'instructional guidance',
      warmth: 0.6,
      directness: 0.6,
      positivity: 0.7,
      description: 'Balanced, informative, constructive'
    },
    stagnant: {
      type: 'motivating',
      style: 'gentle push',
      warmth: 0.7,
      directness: 0.7,
      positivity: 0.75,
      description: 'Motivating with gentle push, actionable'
    },
    neutral: {
      type: 'balanced',
      style: 'instructional',
      warmth: 0.6,
      directness: 0.6,
      positivity: 0.7,
      description: 'Neutral, informative, helpful'
    }
  };

  const selectedTone = tones[emotion] || tones.neutral;

  // Adjust tone based on motivation score if very low or very high
  if (motivationScore < 3 && selectedTone.directness > 0.5) {
    selectedTone.directness = 0.4; // Be less direct with low motivation
    selectedTone.warmth = Math.min(0.9, selectedTone.warmth + 0.1);
  }

  if (motivationScore > 8 && selectedTone.directness < 0.7) {
    selectedTone.directness = 0.7; // Can be more direct with high motivation
  }

  return selectedTone;
}

/**
 * Get tone-specific instructions for AI prompt
 * @param {object} tone - Tone configuration
 * @returns {string} Tone instructions for AI
 */
function getToneInstructions(tone) {
  const instructions = {
    'supportive': 'Be gentle, understanding, and comforting. Show empathy. Avoid being too directive.',
    'uplifting': 'Be hopeful, encouraging, and reassuring. Focus on potential and positive outcomes.',
    'motivating': 'Be energetic, friendly, and inspiring. Use positive language and create enthusiasm.',
    'professional': 'Be clear, constructive, and forward-looking. Focus on growth and next steps.',
    'energetic': 'Be enthusiastic and challenge-oriented. Use dynamic language and inspire action.',
    'encouraging': 'Acknowledge effort, validate struggles, and reinforce persistence. Be empathetic.',
    'balanced': 'Be informative, helpful, and constructive. Maintain neutral but supportive tone.'
  };

  return instructions[tone.type] || instructions.balanced;
}

/**
 * Get example phrases for tone
 * @param {object} tone - Tone configuration
 * @returns {Array<string>} Example phrases
 */
function getToneExamples(tone) {
  const examples = {
    'supportive': [
      "It's completely normal to feel stuck sometimes.",
      "You're doing your best, and that's what matters.",
      "Let's take it one step at a time."
    ],
    'uplifting': [
      "You're capable of great things!",
      "Every small step forward counts.",
      "I believe in your ability to improve."
    ],
    'motivating': [
      "Let's get back into your learning rhythm!",
      "One practice session today can make a difference.",
      "You've got this!"
    ],
    'professional': [
      "Your consistency is showing results.",
      "Let's focus on the next level of improvement.",
      "Great progress—here's what to tackle next."
    ],
    'encouraging': [
      "Your persistence is admirable.",
      "Keep going—you're building resilience.",
      "I see your effort, and it's paying off."
    ]
  };

  return examples[tone.type] || examples.professional;
}

module.exports = {
  selectTone,
  getToneInstructions,
  getToneExamples
};

/**
 * AI Hint Generator Service
 * Generates personalized practice suggestions using OpenAI
 */

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1'
});

/**
 * Generate AI hint based on skill and performance context
 * @param {string} skill - Skill name (reading, listening, writing, speaking)
 * @param {object} context - Performance context object
 * @returns {Promise<string>} AI-generated hint
 */
async function generateAIHint(skill, context) {
  try {
    const {
      accuracy = 0,
      difficulty = 5.5,
      streak = 0,
      totalQuestions = 0,
      commonMistakes = []
    } = context;

    const accuracyPercent = (accuracy * 100).toFixed(1);

    // Skill-specific hints
    const skillGuidance = {
      reading: 'Focus on skimming for main ideas, scanning for specific details, and understanding inference questions.',
      listening: 'Practice note-taking, identifying key words, and understanding different accents and speech patterns.',
      writing: 'Work on task achievement, coherence and cohesion, lexical resource variety, and grammatical accuracy.',
      speaking: 'Improve fluency, pronunciation clarity, lexical range, and grammatical accuracy with natural pauses.'
    };

    const prompt = `You are a Cambridge IELTS AI Coach. The student is practicing ${skill}.

Performance Summary:
- Accuracy: ${accuracyPercent}%
- Current Band Level: ${difficulty.toFixed(1)}
- Consecutive Correct Answers: ${streak}
- Total Questions Attempted: ${totalQuestions}
${commonMistakes.length > 0 ? `- Common Mistakes: ${commonMistakes.join(', ')}` : ''}

${skillGuidance[skill]}

Provide ONE concise, encouraging, and actionable suggestion (max 2 sentences) to help the student improve immediately.

Tone: Supportive, Cambridge mentor style. Be specific and practical.
Format: Direct advice, no fluff. Focus on immediate next steps.

Example good response: "You're improving quickly! Try focusing on paraphrasing key ideas in your answers - this will help with both accuracy and speed."

Now provide your suggestion:`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Cambridge IELTS tutor. Provide clear, actionable advice in a supportive, encouraging tone.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const hint = response.choices[0]?.message?.content?.trim() || 
                 `Keep practicing! Your current accuracy is ${accuracyPercent}%. Focus on ${skillGuidance[skill]}`;

    return hint;
  } catch (error) {
    console.error('[AI Hint Generator] Error:', error.message);
    
    // Fallback hint based on performance
    const { accuracy = 0, difficulty = 5.5, skill } = context;
    const accuracyPercent = (accuracy * 100).toFixed(1);

    if (accuracy > 0.8) {
      return `Excellent work! You're performing well at Band ${difficulty.toFixed(1)}. Try challenging yourself with more complex ${skill} tasks.`;
    } else if (accuracy < 0.5) {
      return `Keep practicing! Focus on the fundamentals of ${skill}. Review key vocabulary and common question types to improve your ${accuracyPercent}% accuracy.`;
    } else {
      return `Good progress! You're at ${accuracyPercent}% accuracy. Continue practicing ${skill} to build consistency.`;
    }
  }
}

/**
 * Generate multiple hints for a practice session
 * @param {string} skill - Skill name
 * @param {object} context - Performance context
 * @param {number} count - Number of hints to generate
 * @returns {Promise<Array<string>>} Array of AI hints
 */
async function generateMultipleHints(skill, context, count = 3) {
  try {
    const hints = [];
    for (let i = 0; i < count; i++) {
      const hint = await generateAIHint(skill, context);
      hints.push(hint);
    }
    return hints;
  } catch (error) {
    console.error('[AI Hint Generator] Error generating multiple hints:', error.message);
    return [generateAIHint(skill, context)]; // Return at least one fallback
  }
}

/**
 * Generate encouragement message based on streak
 * @param {number} streak - Current streak count
 * @returns {string} Encouragement message
 */
function generateStreakEncouragement(streak) {
  if (streak >= 10) {
    return "🔥 Outstanding! You're on fire with a 10+ streak!";
  } else if (streak >= 5) {
    return "🌟 Great streak! You're mastering this skill!";
  } else if (streak >= 3) {
    return "✨ Nice streak! Keep the momentum going!";
  }
  return "💪 Keep practicing! Consistency is key.";
}

module.exports = {
  generateAIHint,
  generateMultipleHints,
  generateStreakEncouragement
};

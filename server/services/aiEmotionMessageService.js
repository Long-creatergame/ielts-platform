/**
 * AI Emotion Message Service
 * Generates personalized emotional AI messages using OpenAI
 */

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1'
});

/**
 * Generate emotion-based AI message
 * @param {string} userName - User's name
 * @param {string} emotion - Detected emotion
 * @param {object} tone - Tone configuration
 * @param {object} context - Performance and engagement context
 * @returns {Promise<string>} AI-generated emotional message
 */
async function generateEmotionMessage(userName, emotion, tone, context) {
  try {
    const {
      accuracy = 0.5,
      streak = 0,
      lastBandChange = 0,
      skill = 'general',
      motivationScore = 5.0
    } = context;

    const accuracyPercent = (accuracy * 100).toFixed(1);
    const bandChangeStr = lastBandChange !== 0 
      ? (lastBandChange > 0 ? `+${lastBandChange.toFixed(1)}` : lastBandChange.toFixed(1))
      : '0.0';

    // Get tone instructions
    const toneInstructions = require('./toneSelector').getToneInstructions(tone);

    const prompt = `You are Cambridge AI Coach, a warm and empathetic IELTS tutor.

Student: ${userName}
Current emotion detected: ${emotion}
Response tone: ${tone.type} (${tone.style})

Performance context:
- Accuracy: ${accuracyPercent}%
- Current streak: ${streak} consecutive correct
- Recent band change: ${bandChangeStr}
- Skill practiced: ${skill}
- Motivation level: ${motivationScore}/10

Tone guidelines: ${toneInstructions}

Write a 1-2 sentence message that:
1. Addresses the student's current emotional state naturally
2. Uses the specified tone (${tone.type} - ${tone.style})
3. Feels human and warm, NOT robotic
4. Provides gentle guidance or encouragement
5. Uses natural, conversational language
6. If struggling (frustrated/discouraged), acknowledge it and offer hope
7. If doing well (confident/motivated), celebrate and suggest next steps

IMPORTANT:
- Avoid phrases like "I understand" or "I see" - be more natural
- Don't be overly formal or mechanical
- Show genuine care and empathy
- Keep it concise (max 2 sentences)
- Use ${userName} naturally if appropriate, but don't overuse

Now write the message:`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Cambridge IELTS tutor with excellent emotional intelligence. You know how to connect with students and motivate them through both challenges and successes. Your communication is natural, warm, and human-like—never robotic.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.85, // Higher temperature for more natural, varied responses
      max_tokens: 120
    });

    const message = response.choices[0]?.message?.content?.trim();

    if (!message) {
      return getFallbackMessage(userName, emotion, tone, context);
    }

    return message;
  } catch (error) {
    console.error('[AI Emotion Message] Error:', error.message);
    return getFallbackMessage(userName, emotion, tone, context);
  }
}

/**
 * Generate fallback message if AI fails
 * @param {string} userName - User's name
 * @param {string} emotion - Detected emotion
 * @param {object} tone - Tone configuration
 * @param {object} context - Performance context
 * @returns {string} Fallback message
 */
function getFallbackMessage(userName, emotion, tone, context) {
  const { accuracy = 0.5, skill = 'general' } = context;
  const accuracyPercent = (accuracy * 100).toFixed(1);

  const fallbacks = {
    frustrated: `${userName}, everyone struggles sometimes. Let's try a simpler ${skill} task and rebuild confidence together.`,
    discouraged: `Don't give up, ${userName}. Your effort matters, and progress often comes in small steps.`,
    disengaged: `Welcome back! Let's ease back into practice with something manageable.`,
    confident: `Excellent work, ${userName}! Your ${accuracyPercent}% accuracy shows real improvement. Let's keep this momentum going.`,
    motivated: `Great energy! Your consistency is paying off. Let's challenge yourself with the next level.`,
    persevering: `Your persistence is admirable, ${userName}. Keep going—you're building real resilience.`,
    steady: `You're making steady progress. Let's focus on specific areas to accelerate your improvement.`,
    stagnant: `Sometimes progress feels slow, but you're building a solid foundation. Let's try a fresh approach.`,
    neutral: `Let's continue building your ${skill} skills. Every practice session brings you closer to your goal.`
  };

  return fallbacks[emotion] || fallbacks.neutral;
}

/**
 * Generate multiple emotional messages (for variety)
 * @param {string} userName - User's name
 * @param {string} emotion - Detected emotion
 * @param {object} tone - Tone configuration
 * @param {object} context - Performance context
 * @param {number} count - Number of messages to generate
 * @returns {Promise<Array<string>>} Array of messages
 */
async function generateMultipleEmotionMessages(userName, emotion, tone, context, count = 3) {
  try {
    const messages = [];
    for (let i = 0; i < count; i++) {
      const message = await generateEmotionMessage(userName, emotion, tone, context);
      messages.push(message);
    }
    return messages;
  } catch (error) {
    console.error('[AI Emotion Message] Error generating multiple:', error.message);
    return [getFallbackMessage(userName, emotion, tone, context)];
  }
}

module.exports = {
  generateEmotionMessage,
  getFallbackMessage,
  generateMultipleEmotionMessages
};

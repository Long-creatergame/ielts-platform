/**
 * AI Feedback Service
 * Generates detailed feedback for Writing and Speaking using OpenAI
 */

const { writingPrompt, speakingPrompt } = require('./aiPromptTemplates');
const AIFeedback = require('../models/AIFeedback');
const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Generate AI feedback for Writing or Speaking
 */
async function generateFeedback({ userId, testId, skill, text, level = 'B1' }) {
  try {
    if (!openai) {
      console.warn('[AI Feedback] OpenAI not configured, returning fallback');
      return getFallbackFeedback(userId, testId, skill);
    }

    console.log(`[AI Feedback] Generating ${skill} feedback for user ${userId}`);
    
    // Select appropriate prompt
    const prompt = skill === 'writing' 
      ? writingPrompt(text, level)
      : speakingPrompt(text, level);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced IELTS tutor. Always return valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Parse JSON response
    let parsed;
    try {
      // Try to extract JSON from markdown or raw text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.warn('[AI Feedback] JSON parsing failed:', parseError.message);
      console.log('[AI Feedback] Raw response:', aiResponse.substring(0, 200));
      return getFallbackFeedback(userId, testId, skill);
    }

    // Validate parsed data
    if (!parsed.bandBreakdown || !parsed.feedback) {
      console.warn('[AI Feedback] Invalid response structure');
      return getFallbackFeedback(userId, testId, skill);
    }

    // Prepare feedback document
    const feedbackData = {
      userId,
      testId,
      skill,
      bandBreakdown: parsed.bandBreakdown,
      feedback: parsed.feedback,
      text: skill === 'writing' ? text : undefined,
      transcript: skill === 'speaking' ? text : undefined,
      createdAt: new Date()
    };

    // Save to MongoDB (upsert: update if exists, insert if new)
    const feedbackDoc = await AIFeedback.findOneAndUpdate(
      { userId, testId, skill },
      { $set: feedbackData },
      { upsert: true, new: true }
    );

    console.log(`[AI Feedback] ✅ ${skill} feedback generated and saved`);
    console.log(`[AI Feedback] Band:`, parsed.bandBreakdown);

    return feedbackDoc;
  } catch (error) {
    console.error('[AI Feedback] Error:', error.message);
    return getFallbackFeedback(userId, testId, skill);
  }
}

/**
 * Get fallback feedback when AI is unavailable or fails
 */
function getFallbackFeedback(userId, testId, skill) {
  const isWriting = skill === 'writing';
  
  const fallback = {
    userId,
    testId,
    skill,
    bandBreakdown: isWriting 
      ? { Grammar: 6.0, Vocabulary: 6.0, Coherence: 6.0, Task: 6.0 }
      : { Fluency: 6.0, Pronunciation: 6.0, Grammar: 6.0, Vocabulary: 6.0 },
    feedback: [
      {
        error: 'Continue practicing to receive detailed AI feedback',
        suggestion: 'Complete more tests to get personalized feedback',
        reason: 'AI feedback generation is currently unavailable',
        type: isWriting ? 'grammar' : 'fluency'
      }
    ],
    createdAt: new Date()
  };

  console.log('[AI Feedback] Using fallback feedback');
  return fallback;
}

/**
 * Get existing feedback for a test
 */
async function getFeedback(userId, testId, skill) {
  try {
    const feedback = await AIFeedback.findOne({ userId, testId, skill })
      .sort({ createdAt: -1 });
    
    return feedback;
  } catch (error) {
    console.error('[AI Feedback] Error fetching feedback:', error.message);
    return null;
  }
}

module.exports = {
  generateFeedback,
  getFeedback
};


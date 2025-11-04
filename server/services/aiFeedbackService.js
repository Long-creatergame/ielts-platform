const AI_Feedback = require('../models/AI_Feedback');
const { assessWriting } = require('./ai/writingAssessment');
const { assessSpeaking } = require('./ai/speakingAssessor');
const { evaluateReading } = require('./ai/readingEvaluator');
const { evaluateListening } = require('./ai/listeningEvaluator');

async function saveFeedback(sessionId, userId, skill, feedback, improvementTips) {
  const doc = await AI_Feedback.findOneAndUpdate(
    { sessionId, skill },
    { $set: { userId, feedback, improvementTips } },
    { upsert: true, new: true }
  );
  return doc;
}

module.exports = { saveFeedback };

async function evaluateWriting(text) {
  const res = await assessWriting(text);
  return { band: res.band_overall, details: res };
}

async function evaluateSpeaking(transcript) {
  const res = await assessSpeaking(transcript);
  return { band: res.band_overall, details: res };
}

function generateFeedback(skill, result) {
  if (skill === 'reading' || skill === 'listening') {
    const { correct = 0, total = 40 } = result || {};
    return `${skill} performance: ${correct}/${total} correct.`;
  }
  if (result?.comments) return result.comments;
  return 'Good effort. Keep practicing to improve your skills.';
}

async function evaluateTest(testResult) {
  const { skill, responses, skillScores, skillBands } = testResult || {};
  if (skill === 'reading') {
    const res = evaluateReading(responses, skillScores?.reading?.answerKeys || []);
    return { bands: { reading: res.band }, overall: res.band, cefr: 'B2' };
  }
  if (skill === 'listening') {
    const res = evaluateListening(responses, skillScores?.listening?.answerKeys || []);
    return { bands: { listening: res.band }, overall: res.band, cefr: 'B2' };
  }
  if (skill === 'writing') {
    const text = Array.isArray(responses) ? responses.join('\n') : responses;
    const res = await assessWriting(text);
    return { bands: { writing: res.band_overall }, overall: res.band_overall, cefr: 'B2' };
  }
  if (skill === 'speaking') {
    const transcript = Array.isArray(responses) ? responses.join(' ') : responses;
    const res = await assessSpeaking(transcript);
    return { bands: { speaking: res.band_overall }, overall: res.band_overall, cefr: 'B2' };
  }
  return { bands: {}, overall: 0, cefr: 'A1' };
}

module.exports.evaluateWriting = evaluateWriting;
module.exports.evaluateSpeaking = evaluateSpeaking;
module.exports.generateFeedback = generateFeedback;
module.exports.evaluateTest = evaluateTest;

/**
 * AI Feedback Service
 * Generates detailed feedback for Writing and Speaking using OpenAI
 */

const { writingPrompt, speakingPrompt } = require('./aiPromptTemplates');
const AIFeedback = require('../models/AIFeedback');
const coachPersonality = require('../config/aiCoachPersonality');
const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Generate AI feedback for Writing or Speaking
 */
async function generateFeedback({ userId, testId, skill, text, level = 'B1', mode = 'academic' }) {
  try {
    if (!openai) {
      console.warn('[AI Feedback] OpenAI not configured, returning fallback');
      return getFallbackFeedback(userId, testId, skill);
    }

    console.log(`[AI Feedback] Generating ${skill} feedback for user ${userId} (${mode})`);
    
    // Select appropriate prompt with mode context
    const prompt = skill === 'writing' 
      ? writingPrompt(text, level, mode)
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

    // Generate AI summary message with level-aware coach personality
    const aiMessage = generateAISummary(parsed.bandBreakdown, skill, level);

    // Prepare feedback document
    const feedbackData = {
      userId,
      testId,
      skill,
      bandBreakdown: parsed.bandBreakdown,
      feedback: parsed.feedback,
      text: skill === 'writing' ? text : undefined,
      transcript: skill === 'speaking' ? text : undefined,
      level,
      aiMessage,
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
 * Generate AI summary message based on band breakdown
 * Uses coach personality for consistent tone
 */
function generateAISummary(bandBreakdown, skill, userLevel = 'B1') {
  try {
    const averages = Object.values(bandBreakdown).filter(v => v > 0);
    const overallAvg = averages.reduce((sum, val) => sum + val, 0) / averages.length;
    
    const isWriting = skill === 'writing';
    const criteriaNames = isWriting 
      ? ['Grammar', 'Vocabulary', 'Coherence', 'Task']
      : ['Fluency', 'Pronunciation', 'Grammar', 'Vocabulary'];
    
    // Find strongest and weakest areas
    const criteriaScores = {};
    criteriaNames.forEach(name => {
      if (bandBreakdown[name]) criteriaScores[name] = bandBreakdown[name];
    });
    
    const entries = Object.entries(criteriaScores);
    entries.sort((a, b) => b[1] - a[1]);
    
    const strongest = entries[0];
    const weakest = entries[entries.length - 1];
    
    // Use coach personality for level-appropriate message
    const style = coachPersonality.levelStyles[userLevel] || coachPersonality.levelStyles['B1'];
    
    // Generate supportive message based on level
    if (overallAvg >= 7.5) {
      return `Excellent work! Your ${strongest[0]} is particularly strong. Keep refining ${weakest[0]} for even higher scores. ${style.focus}`;
    } else if (overallAvg >= 6.5) {
      return `Good progress! Focus on ${weakest[0]} to push your overall band higher. ${style.focus}`;
    } else if (overallAvg >= 5.5) {
      return `Keep practicing! Pay special attention to ${weakest[0]} to improve your scores. ${style.focus}`;
    } else {
      return `Continue working hard! Practice ${weakest[0]} regularly for steady improvement. ${style.focus}`;
    }
  } catch (error) {
    return 'Keep practicing for better results.';
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
    aiMessage: 'Keep practicing for better results.',
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


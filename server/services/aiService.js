/**
 * Unified AI Service for IELTS Platform
 * Consolidates all AI-related functionality (Writing, Speaking, Reading, Recommendation)
 * Entry point: processAI(type, payload)
 */

const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const { saveAIResponseLog } = require('../utils/aiLogger.js');
const { getFeedbackInstructions } = require('../config/aiLevelCalibration.js');

dotenv.config();

// Environment configuration
const ENV = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_API_BASE: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  OPENAI_TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE || '0.85'),
  AI_FALLBACK_MODE: process.env.AI_FALLBACK_MODE === 'true' || !process.env.OPENAI_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Initialize OpenAI client
const openai = ENV.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: ENV.OPENAI_API_KEY,
      baseURL: ENV.OPENAI_API_BASE,
    })
  : null;

/**
 * Main entry point for all AI processing
 * @param {string} type - 'writing' | 'speaking' | 'reading' | 'recommendation'
 * @param {object} input - Input payload (varies by type)
 * @returns {Promise<object>} AI response
 */
async function processAI(type, input) {
  try {
    console.log(`[AI Service] Processing ${type} request`);

    switch (type) {
      case 'writing':
        return await handleWritingFeedback(input);
      case 'speaking':
        return await handleSpeakingFeedback(input);
      case 'reading':
        return await handleReadingGenerator(input);
      case 'recommendation':
        return await handleRecommendation(input);
      default:
        throw new Error(`Unknown AI process type: ${type}`);
    }
  } catch (err) {
    console.error(`[AI Service] Error processing ${type}:`, err.message);
    if (ENV.AI_FALLBACK_MODE) {
      return getFallbackResponse(type, input);
    }
    throw err;
  }
}

/**
 * Handle Writing feedback assessment
 */
async function handleWritingFeedback({ essay, taskType = 'Task 2', level = 'B1', options = {} }) {
  if (!openai || ENV.AI_FALLBACK_MODE) {
    return getFallbackResponse('writing', { taskType, level });
  }

  try {
    const feedbackInstructions = getFeedbackInstructions(level, 'writing');
    const prompt = createWritingPrompt(essay, taskType, level, feedbackInstructions);

    const response = await openai.chat.completions.create({
      model: ENV.OPENAI_MODEL,
      temperature: ENV.OPENAI_TEMPERATURE,
      messages: [
        {
          role: 'system',
          content: 'You are an expert IELTS examiner. Always respond with valid JSON format as requested.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1500,
    });

    const result = parseJSONResponse(response, 'writing');
    
    // Apply weights if provided
    if (options.weights) {
      result.data = applyWeights(result.data, {
        coherence: options.weights.coherence ?? 0.25,
        lexical: options.weights.lexical ?? 0.25,
        grammar: options.weights.grammar ?? 0.25,
        taskResponse: options.weights.taskResponse ?? 0.25,
      });
    }

    await saveAIResponseLog('writing', { essay: essay.slice(0, 100), taskType, level }, result);
    
    return result;
  } catch (error) {
    console.error('[AI Service] Writing feedback error:', error);
    return getFallbackResponse('writing', { taskType, level });
  }
}

/**
 * Handle Speaking feedback assessment
 */
async function handleSpeakingFeedback({ transcript, taskType = 'Part 2', level = 'B1', options = {} }) {
  if (!openai || ENV.AI_FALLBACK_MODE) {
    return getFallbackResponse('speaking', { taskType, level });
  }

  try {
    const feedbackInstructions = getFeedbackInstructions(level, 'speaking');
    const prompt = createSpeakingPrompt(transcript, taskType, level, feedbackInstructions);

    const response = await openai.chat.completions.create({
      model: ENV.OPENAI_MODEL,
      temperature: ENV.OPENAI_TEMPERATURE,
      messages: [
        {
          role: 'system',
          content: 'You are an expert IELTS examiner. Always respond with valid JSON format as requested.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1500,
    });

    const result = parseJSONResponse(response, 'speaking');
    
    // Apply weights if provided
    if (options.weights) {
      result.data = applyWeights(result.data, {
        fluency: options.weights.fluency ?? 0.25,
        lexical: options.weights.lexical ?? 0.25,
        grammar: options.weights.grammar ?? 0.25,
        pronunciation: options.weights.pronunciation ?? 0.25,
      });
    }

    await saveAIResponseLog('speaking', { transcript: transcript.slice(0, 100), taskType, level }, result);
    
    return result;
  } catch (error) {
    console.error('[AI Service] Speaking feedback error:', error);
    return getFallbackResponse('speaking', { taskType, level });
  }
}

/**
 * Handle Reading question generation
 */
async function handleReadingGenerator({ topic, level = '6.5', band = 6.5 }) {
  if (!openai || ENV.AI_FALLBACK_MODE) {
    return getFallbackResponse('reading', { topic, level });
  }

  try {
    const templatePath = path.join(process.cwd(), 'ai-prompts/reading-generator-template.md');
    let template = '';
    try {
      template = await fs.readFile(templatePath, 'utf-8');
    } catch {
      template = 'Generate an IELTS Academic Reading passage and questions.';
    }

    const prompt = `Generate IELTS Reading practice content.
Level: ${level}
Band: ${band}
Topic: ${topic || 'general IELTS topic'}

${template}

Provide response in JSON format:
{
  "passage": "...",
  "questions": [
    {
      "type": "true_false_not_given",
      "question": "...",
      "answer": "True",
      "explanation": "..."
    }
  ],
  "timeLimit": 60,
  "difficulty": "${band}"
}`;

    const response = await openai.chat.completions.create({
      model: ENV.OPENAI_MODEL,
      temperature: ENV.OPENAI_TEMPERATURE,
      messages: [
        {
          role: 'system',
          content: 'You are an IELTS question generator. Create authentic IELTS-style questions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
    });

    const result = parseJSONResponse(response, 'reading');
    await saveAIResponseLog('reading', { topic, level, band }, result);
    
    return result;
  } catch (error) {
    console.error('[AI Service] Reading generation error:', error);
    return getFallbackResponse('reading', { topic, level });
  }
}

/**
 * Handle Recommendation generation
 */
async function handleRecommendation({ weaknessProfile, userLevel = 'B1', currentBand = 6.0, targetBand = 7.0 }) {
  if (!openai || ENV.AI_FALLBACK_MODE) {
    return getFallbackResponse('recommendation', { weaknessProfile, userLevel });
  }

  try {
    const templatePath = path.join(process.cwd(), 'ai-prompts/recommendation-template.md');
    let template = '';
    try {
      template = await fs.readFile(templatePath, 'utf-8');
    } catch {
      template = 'Generate personalized learning recommendations.';
    }

    const weakestSkill = weaknessProfile?.weakestSkill || 'general';
    const prompt = `Generate personalized IELTS learning recommendations.
User Level: ${userLevel}
Current Band: ${currentBand}
Target Band: ${targetBand}
Weakest Skill: ${weakestSkill}

${template}

Weakness Profile: ${JSON.stringify(weaknessProfile)}

Provide response in JSON format:
{
  "focusArea": "...",
  "actions": ["...", "..."],
  "timeframe": "...",
  "resources": ["...", "..."],
  "expectedImprovement": "...",
  "difficulty": "..."
}`;

    const response = await openai.chat.completions.create({
      model: ENV.OPENAI_MODEL,
      temperature: ENV.OPENAI_TEMPERATURE,
      messages: [
        {
          role: 'system',
          content: 'You are an IELTS tutor. Generate personalized learning recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
    });

    const result = parseJSONResponse(response, 'recommendation');
    await saveAIResponseLog('recommendation', { weaknessProfile, userLevel }, result);
    
    return result;
  } catch (error) {
    console.error('[AI Service] Recommendation error:', error);
    return getFallbackResponse('recommendation', { weaknessProfile, userLevel });
  }
}

/**
 * Create writing prompt with level calibration
 */
function createWritingPrompt(answer, taskType, level, feedbackInstructions) {
  return `
You are an expert IELTS examiner. Score this ${taskType} writing response on a 0-9 scale for a ${level} level student.

${feedbackInstructions}

Student's ${taskType} response:
"""${answer}"""

Provide your assessment in this EXACT JSON format:
{
  "overall": 7.0,
  "taskResponse": 7,
  "coherence": 7,
  "lexical": 6.5,
  "grammar": 7,
  "feedback": "Your essay shows good organization and clear arguments. However, you could improve vocabulary variety and sentence structure complexity. Focus on using more advanced linking words and varied sentence patterns.",
  "strengths": ["Clear thesis statement", "Good paragraph structure"],
  "improvements": ["Use more varied vocabulary", "Add complex sentence structures"],
  "bandLevel": "7.0"
}

Make sure the feedback language and examples match the ${level} proficiency level. Keep it constructive and specific.
`;
}

/**
 * Create speaking prompt with level calibration
 */
function createSpeakingPrompt(answer, taskType, level, feedbackInstructions) {
  return `
You are an expert IELTS examiner. Score this ${taskType} speaking response on a 0-9 scale for a ${level} level student.

${feedbackInstructions}

Student's ${taskType} response:
"""${answer}"""

Provide your assessment in this EXACT JSON format:
{
  "overall": 7.0,
  "fluency": 7,
  "lexical": 6.5,
  "grammar": 7,
  "pronunciation": 7,
  "feedback": "Your speaking shows good fluency and clear ideas. However, you could improve vocabulary variety and use more complex sentence structures. Focus on using more advanced linking words and varied sentence patterns.",
  "strengths": ["Clear pronunciation", "Good fluency"],
  "improvements": ["Use more varied vocabulary", "Add complex sentence structures"],
  "bandLevel": "7.0"
}

Make sure the feedback language and examples match the ${level} proficiency level. Keep it constructive and specific.
`;
}

/**
 * Parse JSON from OpenAI response
 */
function parseJSONResponse(response, skill) {
  try {
    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const scoreData = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: scoreData,
        source: 'ai',
      };
    }
  } catch (error) {
    console.error('[AI Service] JSON parse error:', error);
  }

  return getFallbackResponse(skill);
}

/**
 * Apply weights to score calculation
 */
function applyWeights(data, weights) {
  try {
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    let weighted = 0;
    let total = 0;
    
    Object.entries(weights).forEach(([k, w]) => {
      if (typeof data[k] === 'number') {
        weighted += data[k] * w;
        total += w;
      }
    });
    
    if (total > 0) {
      const overall = clamp(Number((weighted / total).toFixed(1)), 0, 9);
      data.overall = overall;
      data.bandLevel = String(overall);
    }
  } catch (error) {
    console.error('[AI Service] Weight application error:', error);
  }
  
  return data;
}

/**
 * Get fallback response when AI is unavailable
 */
function getFallbackResponse(type, context = {}) {
  const fallbackScores = {
    writing: {
      success: true,
      data: {
        overall: 6.5,
        taskResponse: 6,
        coherence: 7,
        lexical: 6,
        grammar: 7,
        feedback: 'This is a sample assessment. For detailed AI feedback, please ensure your OpenAI API key is configured correctly.',
        strengths: ['Good structure', 'Clear ideas'],
        improvements: ['Improve vocabulary', 'Add examples'],
        bandLevel: '6.5',
      },
      source: 'fallback',
    },
    speaking: {
      success: true,
      data: {
        overall: 6.5,
        fluency: 6,
        lexical: 6,
        grammar: 7,
        pronunciation: 7,
        feedback: 'This is a sample assessment. For detailed AI feedback, please ensure your OpenAI API key is configured correctly.',
        strengths: ['Clear pronunciation', 'Good fluency'],
        improvements: ['Improve vocabulary', 'Add examples'],
        bandLevel: '6.5',
      },
      source: 'fallback',
    },
    reading: {
      success: true,
      data: {
        passage: 'Sample IELTS reading passage. This is a fallback when AI is unavailable.',
        questions: [
          {
            type: 'true_false_not_given',
            question: 'Sample question',
            answer: 'True',
            explanation: 'Sample explanation',
          },
        ],
        timeLimit: 60,
        difficulty: '6.5',
      },
      source: 'fallback',
    },
    recommendation: {
      success: true,
      data: {
        focusArea: 'General Practice',
        actions: ['Continue practicing all IELTS skills', 'Focus on weakest areas'],
        timeframe: '3 weeks',
        resources: ['Practice Tests', 'Sample Materials'],
        expectedImprovement: '0.5-1.0 band',
        difficulty: 'intermediate',
      },
      source: 'fallback',
    },
  };

  return fallbackScores[type] || {
    success: false,
    message: `AI unavailable, fallback mode active (${type})`,
    source: 'fallback',
  };
}

// Export for backward compatibility
module.exports = {
  processAI,
  isAvailable: !!openai && !ENV.AI_FALLBACK_MODE,
};


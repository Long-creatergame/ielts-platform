const OpenAI = require('openai');
const dotenv = require('dotenv');
const { getFeedbackInstructions } = require('../config/aiLevelCalibration');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
});

class AIScoringService {
  constructor() {
    this.isAvailable = !!process.env.OPENAI_API_KEY;
  }

  async scoreWriting(answer, taskType = 'Task 2', options = {}) {
    if (!this.isAvailable) {
      return this.getFallbackScore('writing');
    }

    try {
      const level = options.level || 'B1';
      const prompt = this.createWritingPrompt(answer, taskType, level);
      const response = await this.callOpenAI(prompt);
      const parsed = this.parseResponse(response);
      console.log(`[AI Feedback] Writing | Level: ${level} | Tone: ${getFeedbackInstructions(level, 'writing').includes('simple') ? 'Simple' : 'Advanced'}`);
      return this.applyWeights(parsed, {
        coherence: options.weights?.coherence ?? 0.25,
        lexical: options.weights?.lexical ?? 0.25,
        grammar: options.weights?.grammar ?? 0.25,
        taskResponse: options.weights?.taskResponse ?? 0.25,
      });
    } catch (error) {
      console.error('AI Scoring Error:', error);
      return this.getFallbackScore('writing');
    }
  }

  createWritingPrompt(answer, taskType, level = 'B1') {
    const feedbackInstructions = getFeedbackInstructions(level, 'writing');
    
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

  async callOpenAI(prompt) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert IELTS examiner. Always respond with valid JSON format as requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return completion.choices[0].message.content;
  }

  parseResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const scoreData = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: scoreData,
          source: 'ai'
        };
      }
    } catch (error) {
      console.error('JSON Parse Error:', error);
    }

    return this.getFallbackScore();
  }

  applyWeights(result, weights) {
    try {
      if (!result?.data) return result;
      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
      let weighted = 0;
      let total = 0;
      Object.entries(weights).forEach(([k, w]) => {
        if (typeof result.data[k] === 'number') {
          weighted += result.data[k] * w;
          total += w;
        }
      });
      if (total > 0) {
        const overall = clamp(Number((weighted / total).toFixed(1)), 0, 9);
        result.data.overall = overall;
        result.data.bandLevel = String(overall);
      }
    } catch (_) {}
    return result;
  }

  getFallbackScore() {
    return {
      success: true,
      data: {
        overall: 6.5,
        taskResponse: 6,
        coherence: 7,
        lexical: 6,
        grammar: 7,
        feedback: 'This is a sample assessment. Configure OPENAI_API_KEY for live scoring.',
        strengths: ['Good structure', 'Clear ideas'],
        improvements: ['Improve vocabulary', 'Add stronger examples'],
        bandLevel: '6.5',
        source: 'fallback',
      },
      source: 'fallback',
    };
  }
}

module.exports = new AIScoringService();

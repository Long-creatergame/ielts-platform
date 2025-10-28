const OpenAI = require('openai');
const dotenv = require('dotenv');

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
      const prompt = this.createWritingPrompt(answer, taskType);
      const response = await this.callOpenAI(prompt);
      const parsed = this.parseResponse(response, 'writing');
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

  async scoreSpeaking(answer, taskType = 'Part 2', options = {}) {
    if (!this.isAvailable) {
      return this.getFallbackScore('speaking');
    }

    try {
      const prompt = this.createSpeakingPrompt(answer, taskType);
      const response = await this.callOpenAI(prompt);
      const parsed = this.parseResponse(response, 'speaking');
      return this.applyWeights(parsed, {
        fluency: options.weights?.fluency ?? 0.25,
        lexical: options.weights?.lexical ?? 0.25,
        grammar: options.weights?.grammar ?? 0.25,
        pronunciation: options.weights?.pronunciation ?? 0.25,
      });
    } catch (error) {
      console.error('AI Scoring Error:', error);
      return this.getFallbackScore('speaking');
    }
  }

  createWritingPrompt(answer, taskType) {
    return `
You are an expert IELTS examiner. Score this ${taskType} writing response on a 0-9 scale.

IELTS Writing Assessment Criteria:
1. Task Response (25%) - How well the task is addressed
2. Coherence and Cohesion (25%) - Organization and linking
3. Lexical Resource (25%) - Vocabulary range and accuracy
4. Grammar Range and Accuracy (25%) - Grammar variety and correctness

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

Make sure the feedback is constructive and specific, around 50-100 words.
`;
  }

  createSpeakingPrompt(answer, taskType) {
    return `
You are an expert IELTS examiner. Score this ${taskType} speaking response on a 0-9 scale.

IELTS Speaking Assessment Criteria:
1. Fluency and Coherence (25%) - Flow and organization
2. Lexical Resource (25%) - Vocabulary range and accuracy
3. Grammar Range and Accuracy (25%) - Grammar variety and correctness
4. Pronunciation (25%) - Clarity and intelligibility

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

Make sure the feedback is constructive and specific, around 50-100 words.
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

  parseResponse(response, skill) {
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

    return this.getFallbackScore(skill);
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

  getFallbackScore(skill) {
    const fallbackScores = {
      writing: {
        overall: 6.5,
        taskResponse: 6,
        coherence: 7,
        lexical: 6,
        grammar: 7,
        feedback: "This is a sample assessment. For detailed AI feedback, please ensure your OpenAI API key is configured correctly.",
        strengths: ["Good structure", "Clear ideas"],
        improvements: ["Improve vocabulary", "Add examples"],
        bandLevel: "6.5",
        source: 'fallback'
      },
      speaking: {
        overall: 6.5,
        fluency: 6,
        lexical: 6,
        grammar: 7,
        pronunciation: 7,
        feedback: "This is a sample assessment. For detailed AI feedback, please ensure your OpenAI API key is configured correctly.",
        strengths: ["Clear pronunciation", "Good fluency"],
        improvements: ["Improve vocabulary", "Add examples"],
        bandLevel: "6.5",
        source: 'fallback'
      }
    };

    return {
      success: true,
      data: fallbackScores[skill],
      source: 'fallback'
    };
  }

  async generatePracticeQuestions(skill, level = 'intermediate') {
    if (!this.isAvailable) {
      return this.getFallbackQuestions(skill, level);
    }

    try {
      const prompt = this.createPracticePrompt(skill, level);
      const response = await this.callOpenAI(prompt);
      return this.parseResponse(response, 'practice');
    } catch (error) {
      console.error('AI Practice Generation Error:', error);
      return this.getFallbackQuestions(skill, level);
    }
  }

  createPracticePrompt(skill, level) {
    return `
Generate 3 ${skill} practice questions for IELTS ${level} level students.

For ${skill}:
- Make questions realistic and challenging
- Include clear instructions
- Provide sample answers
- Focus on common IELTS topics

Provide your response in this EXACT JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "instructions": "Clear instructions",
      "sampleAnswer": "Sample answer",
      "difficulty": "${level}",
      "topic": "Common IELTS topic"
    }
  ],
  "skill": "${skill}",
  "level": "${level}"
}
`;
  }

  getFallbackQuestions(skill, level) {
    const fallbackQuestions = {
      writing: [
        {
          id: 1,
          question: "Some people believe that technology has made our lives more complicated. To what extent do you agree or disagree?",
          instructions: "Write at least 250 words. Give reasons for your answer and include relevant examples.",
          sampleAnswer: "Technology has both simplified and complicated our lives...",
          difficulty: level,
          topic: "Technology"
        }
      ],
      speaking: [
        {
          id: 1,
          question: "Describe a memorable trip you have taken.",
          instructions: "You should say: where you went, who you went with, what you did, and explain why it was memorable.",
          sampleAnswer: "I would like to talk about a trip to Japan...",
          difficulty: level,
          topic: "Travel"
        }
      ]
    };

    return {
      success: true,
      data: {
        questions: fallbackQuestions[skill] || [],
        skill: skill,
        level: level
      },
      source: 'fallback'
    };
  }
}

module.exports = new AIScoringService();

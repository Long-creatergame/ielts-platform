const OpenAI = require('openai');
const dotenv = require('dotenv');
const { z } = require('zod');
const { getFeedbackInstructions } = require('../config/aiLevelCalibration');

dotenv.config();

function createClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
  });
}

const PROMPT_VERSION = 'writing-task2-json-v1';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const scoringSchema = z.object({
  overallBand: z.number().min(0).max(9),
  criteria: z.object({
    taskResponse: z.number().min(0).max(9),
    coherence: z.number().min(0).max(9),
    lexical: z.number().min(0).max(9),
    grammar: z.number().min(0).max(9),
  }),
  comments: z.array(z.string().min(1)).min(1).max(12),
});

function toNumberOrNull(value) {
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? n : null;
}

function clampBand(value) {
  const n = toNumberOrNull(value);
  if (n === null) return null;
  return Math.max(0, Math.min(9, Number(n)));
}

function normalizeToAiScore(validated) {
  const overall = Number(validated.overallBand.toFixed(1));
  return {
    overall,
    taskResponse: Number(validated.criteria.taskResponse),
    coherence: Number(validated.criteria.coherence),
    lexical: Number(validated.criteria.lexical),
    grammar: Number(validated.criteria.grammar),
    feedback: validated.comments.join('\n'),
    strengths: [],
    improvements: [],
    bandLevel: String(overall),
    source: 'ai',
  };
}

class AIScoringService {
  async scoreWriting(answer, taskType = 'Task 2', options = {}) {
    if (!process.env.OPENAI_API_KEY) {
      const err = new Error('AI scoring not configured');
      err.status = 503;
      throw err;
    }

    const level = options.level || 'B1';
    const prompt = this.createWritingPrompt(answer, taskType, level);
    const model = options.model || DEFAULT_MODEL;

    try {
      const startedAt = Date.now();
      const responseText = await this.callOpenAI(prompt, { model });
      const latencyMs = Date.now() - startedAt;

      const validated = this.parseAndValidate(responseText);
      const aiScore = normalizeToAiScore(validated);

      return {
        success: true,
        source: 'ai',
        data: aiScore,
        scoringMeta: {
          source: 'ai',
          model,
          promptVersion: PROMPT_VERSION,
          latencyMs,
        },
      };
    } catch (error) {
      console.error('AI Scoring Error:', error);
      if (!error.status) {
        error.status = error.name === 'AbortError' ? 504 : 502;
      }
      if (!error.publicMessage) {
        error.publicMessage =
          error.status === 504
            ? 'AI scoring timed out, please try again.'
            : 'AI scoring failed, please try again.';
      }
      throw error;
    }
  }

  createWritingPrompt(answer, taskType, level = 'B1') {
    const feedbackInstructions = getFeedbackInstructions(level, 'writing');
    
    return `
You are an expert IELTS examiner. Score this ${taskType} writing response on a 0-9 scale for a ${level} level student.

${feedbackInstructions}

Student's ${taskType} response:
"""${answer}"""

Return ONLY valid JSON. No markdown, no extra keys, no surrounding text.
JSON schema:
{
  "overallBand": 7.0,
  "criteria": {
    "taskResponse": 7.0,
    "coherence": 7.0,
    "lexical": 6.5,
    "grammar": 7.0
  },
  "comments": [
    "Comment 1 (specific, actionable).",
    "Comment 2 ...",
    "Comment 3 ..."
  ]
}
Rules:
- All band scores must be numbers between 0 and 9 (decimals allowed).
- comments must be 3-8 short bullet-like sentences (no numbering required).
Make sure the language matches ${level} proficiency level and stays constructive.
`;
  }

  async callOpenAI(prompt, { model }) {
    const openai = createClient();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    try {
      const baseRequest = {
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert IELTS examiner. Return ONLY valid JSON matching the provided schema. Do not include markdown.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 500,
      };

      let completion;
      try {
        completion = await openai.chat.completions.create(
          {
            ...baseRequest,
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'ielts_writing_score',
                strict: true,
                schema: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    overallBand: { type: 'number' },
                    criteria: {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        taskResponse: { type: 'number' },
                        coherence: { type: 'number' },
                        lexical: { type: 'number' },
                        grammar: { type: 'number' },
                      },
                      required: ['taskResponse', 'coherence', 'lexical', 'grammar'],
                    },
                    comments: {
                      type: 'array',
                      items: { type: 'string' },
                      minItems: 3,
                      maxItems: 8,
                    },
                  },
                  required: ['overallBand', 'criteria', 'comments'],
                },
              },
            },
          },
          { signal: controller.signal, timeout: 25_000 }
        );
      } catch (_) {
        completion = await openai.chat.completions.create(baseRequest, {
          signal: controller.signal,
          timeout: 25_000,
        });
      }

      return completion.choices[0].message.content;
    } finally {
      clearTimeout(timeout);
    }
  }

  parseAndValidate(responseText) {
    const tryParse = (text) => {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    };

    const extracted = () => {
      if (typeof responseText !== 'string') return null;
      const match = responseText.match(/\{[\s\S]*\}/);
      if (!match) return null;
      return tryParse(match[0]);
    };

    const raw =
      (typeof responseText === 'string' ? tryParse(responseText) : null) ||
      extracted() ||
      null;

    if (!raw || typeof raw !== 'object') {
      const err = new Error('Invalid AI response format');
      err.status = 502;
      err.publicMessage = 'AI returned an invalid response. Please try again.';
      throw err;
    }

    const coerced = {
      overallBand: clampBand(raw.overallBand) ?? clampBand(raw.overall) ?? null,
      criteria: {
        taskResponse: clampBand(raw?.criteria?.taskResponse) ?? clampBand(raw.taskResponse) ?? null,
        coherence: clampBand(raw?.criteria?.coherence) ?? clampBand(raw.coherence) ?? null,
        lexical: clampBand(raw?.criteria?.lexical) ?? clampBand(raw.lexical) ?? null,
        grammar: clampBand(raw?.criteria?.grammar) ?? clampBand(raw.grammar) ?? null,
      },
      comments: Array.isArray(raw.comments)
        ? raw.comments
        : typeof raw.feedback === 'string'
          ? raw.feedback
              .split(/\n+/)
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
    };

    const result = scoringSchema.safeParse(coerced);
    if (!result.success) {
      const err = new Error('Invalid AI response content');
      err.status = 502;
      err.publicMessage = 'AI returned an invalid score format. Please try again.';
      throw err;
    }

    return result.data;
  }

}

module.exports = new AIScoringService();

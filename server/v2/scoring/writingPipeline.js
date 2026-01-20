const crypto = require('crypto');
const { callJson } = require('./llmClient');
const { writingReportSchema } = require('./reportSchema');

const PROMPT_VERSION = 'v2-writing-task2-mvp-2026-01';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function roundToHalf(x) {
  return Math.round(x * 2) / 2;
}

function clampBand(x) {
  return Math.max(0, Math.min(9, x));
}

function hashInput(parts) {
  const h = crypto.createHash('sha256');
  for (const p of parts) h.update(String(p || ''));
  return h.digest('hex');
}

function computeConfidence(criteria) {
  const vals = Object.values(criteria);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
  // heuristic: tighter criteria spread => higher confidence
  const conf = 1 - Math.min(1, Math.sqrt(variance) / 2);
  return Number(conf.toFixed(2));
}

function defaultNextSteps(weaknesses) {
  return weaknesses.slice(0, 3).map((w, idx) => ({
    focus: `${w.area}`,
    exercise: idx === 0 ? 'Rewrite 2 paragraphs focusing on clear topic sentences and logical linking.' : idx === 1 ? 'Do a 10-minute error-log and rewrite 10 sentences with the same structure correctly.' : 'Write an outline (intro + 2 body + conclusion) in 5 minutes, then write one body paragraph in 10 minutes.',
    success_metric: 'Improve clarity and reduce recurring errors; re-score within ±0.5 band stability.',
  }));
}

function parseJsonStrict(text) {
  try {
    return JSON.parse(text);
  } catch {
    const m = String(text).match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}

async function scoreWriting({ promptText, essayText, lastReport }) {
  const seed = Number(process.env.SCORING_SEED || 12345);
  const temperature = 0; // stability

  const inputHash = hashInput([PROMPT_VERSION, promptText, essayText]);

  const system =
    'You are a senior IELTS Academic Writing examiner. You must output ONLY JSON that matches the provided schema. ' +
    'Scoring must be stable and based on IELTS band descriptors. Do not count grammar errors mechanically; judge communicative effectiveness.';

  const user = [
    `TASK: IELTS Academic Writing Task 2.`,
    `PROMPT:\n${promptText}`,
    `CANDIDATE ESSAY:\n${essayText}`,
    `OUTPUT REQUIREMENTS:`,
    `- Provide stable band scores (same input -> same output within ±0.5).`,
    `- Provide concise rationale bullet points per criterion.`,
    `- Provide exactly top_3_weaknesses with pattern + impact.`,
    `- Provide a realistic 7-day plan (next_steps_7_days).`,
    lastReport ? `PREVIOUS REPORT (for delta only):\n${JSON.stringify(lastReport)}` : `PREVIOUS REPORT: null`,
  ].join('\n\n');

  const schema = {
    name: 'ielts_writing_score_report',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        overall_band: { type: 'number' },
        criteria: {
          type: 'object',
          additionalProperties: false,
          properties: {
            task: { type: 'number' },
            coherence: { type: 'number' },
            lexical: { type: 'number' },
            grammar: { type: 'number' },
          },
          required: ['task', 'coherence', 'lexical', 'grammar'],
        },
        confidence: { type: 'number' },
        band_rationale: {
          type: 'object',
          additionalProperties: false,
          properties: {
            task: { type: 'array', items: { type: 'string' }, minItems: 1 },
            coherence: { type: 'array', items: { type: 'string' }, minItems: 1 },
            lexical: { type: 'array', items: { type: 'string' }, minItems: 1 },
            grammar: { type: 'array', items: { type: 'string' }, minItems: 1 },
          },
          required: ['task', 'coherence', 'lexical', 'grammar'],
        },
        top_3_weaknesses: {
          type: 'array',
          minItems: 3,
          maxItems: 3,
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              area: { type: 'string' },
              pattern: { type: 'string' },
              impact: { type: 'string' },
            },
            required: ['area', 'pattern', 'impact'],
          },
        },
        next_steps_7_days: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              focus: { type: 'string' },
              exercise: { type: 'string' },
              success_metric: { type: 'string' },
            },
            required: ['focus', 'exercise', 'success_metric'],
          },
        },
        delta_vs_last_attempt: {
          type: 'object',
          additionalProperties: false,
          properties: {
            overall: { type: 'number' },
            criteria: {
              type: 'object',
              additionalProperties: false,
              properties: {
                task: { type: 'number' },
                coherence: { type: 'number' },
                lexical: { type: 'number' },
                grammar: { type: 'number' },
              },
              required: ['task', 'coherence', 'lexical', 'grammar'],
            },
          },
          required: ['overall', 'criteria'],
        },
      },
      required: [
        'overall_band',
        'criteria',
        'confidence',
        'band_rationale',
        'top_3_weaknesses',
        'next_steps_7_days',
        'delta_vs_last_attempt',
      ],
    },
  };

  const raw = await callJson({ system, user, schema, model: DEFAULT_MODEL, temperature, seed });
  const parsed = parseJsonStrict(raw);
  if (!parsed) {
    const err = new Error('AI returned invalid JSON');
    err.statusCode = 502;
    err.publicMessage = 'AI returned invalid scoring output.';
    throw err;
  }

  // Hard clamp/round for repeatability
  const criteria = {
    task: roundToHalf(clampBand(Number(parsed.criteria?.task ?? 0))),
    coherence: roundToHalf(clampBand(Number(parsed.criteria?.coherence ?? 0))),
    lexical: roundToHalf(clampBand(Number(parsed.criteria?.lexical ?? 0))),
    grammar: roundToHalf(clampBand(Number(parsed.criteria?.grammar ?? 0))),
  };
  const overall = roundToHalf(
    clampBand((criteria.task + criteria.coherence + criteria.lexical + criteria.grammar) / 4)
  );

  const report = {
    ...parsed,
    overall_band: overall,
    criteria,
    confidence: computeConfidence(criteria),
  };

  // Ensure next_steps exists even if model output is weak
  if (!Array.isArray(report.next_steps_7_days) || report.next_steps_7_days.length === 0) {
    report.next_steps_7_days = defaultNextSteps(report.top_3_weaknesses || []);
  }

  const validated = writingReportSchema.safeParse(report);
  if (!validated.success) {
    const err = new Error('AI returned invalid report schema');
    err.statusCode = 502;
    err.publicMessage = 'AI returned an invalid scoring report format.';
    err.details = validated.error.issues;
    throw err;
  }

  return {
    inputHash,
    promptVersion: PROMPT_VERSION,
    model: DEFAULT_MODEL,
    temperature,
    report: validated.data,
  };
}

module.exports = { scoreWriting, PROMPT_VERSION };


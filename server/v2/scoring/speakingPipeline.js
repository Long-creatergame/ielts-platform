const crypto = require('crypto');
const { callJson } = require('./llmClient');
const { speakingReportSchema } = require('./reportSchema');

const PROMPT_VERSION = 'v2-speaking-part2-mvp-2026-01';
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
  const conf = 1 - Math.min(1, Math.sqrt(variance) / 2);
  return Number(conf.toFixed(2));
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

async function scoreSpeaking({ cueCardText, transcript, lastReport }) {
  const seed = Number(process.env.SCORING_SEED || 12345);
  const temperature = 0;
  const inputHash = hashInput([PROMPT_VERSION, cueCardText, transcript]);

  const system =
    'You are a senior IELTS Speaking examiner (Academic/General). Output ONLY JSON matching the schema. ' +
    'Use band descriptors; do not over-count grammar. Judge intelligibility, range, control, and fluency.';

  const user = [
    `TASK: IELTS Speaking Part 2 (cue card).`,
    `CUE CARD:\n${cueCardText}`,
    `TRANSCRIPT (ASR or typed):\n${transcript}`,
    `OUTPUT REQUIREMENTS: stable scoring; top_3_weaknesses; 7-day plan.`,
    lastReport ? `PREVIOUS REPORT (for delta only):\n${JSON.stringify(lastReport)}` : `PREVIOUS REPORT: null`,
  ].join('\n\n');

  const schema = {
    name: 'ielts_speaking_score_report',
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
            fluency: { type: 'number' },
            lexical: { type: 'number' },
            grammar: { type: 'number' },
            pronunciation: { type: 'number' },
          },
          required: ['fluency', 'lexical', 'grammar', 'pronunciation'],
        },
        confidence: { type: 'number' },
        band_rationale: {
          type: 'object',
          additionalProperties: false,
          properties: {
            fluency: { type: 'array', items: { type: 'string' }, minItems: 1 },
            lexical: { type: 'array', items: { type: 'string' }, minItems: 1 },
            grammar: { type: 'array', items: { type: 'string' }, minItems: 1 },
            pronunciation: { type: 'array', items: { type: 'string' }, minItems: 1 },
          },
          required: ['fluency', 'lexical', 'grammar', 'pronunciation'],
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
                fluency: { type: 'number' },
                lexical: { type: 'number' },
                grammar: { type: 'number' },
                pronunciation: { type: 'number' },
              },
              required: ['fluency', 'lexical', 'grammar', 'pronunciation'],
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
    err.publicMessage = 'AI returned invalid speaking scoring output.';
    throw err;
  }

  const criteria = {
    fluency: roundToHalf(clampBand(Number(parsed.criteria?.fluency ?? 0))),
    lexical: roundToHalf(clampBand(Number(parsed.criteria?.lexical ?? 0))),
    grammar: roundToHalf(clampBand(Number(parsed.criteria?.grammar ?? 0))),
    pronunciation: roundToHalf(clampBand(Number(parsed.criteria?.pronunciation ?? 0))),
  };
  const overall = roundToHalf(
    clampBand((criteria.fluency + criteria.lexical + criteria.grammar + criteria.pronunciation) / 4)
  );

  const report = {
    ...parsed,
    overall_band: overall,
    criteria,
    confidence: computeConfidence(criteria),
  };

  const validated = speakingReportSchema.safeParse(report);
  if (!validated.success) {
    const err = new Error('AI returned invalid report schema');
    err.statusCode = 502;
    err.publicMessage = 'AI returned an invalid speaking scoring report format.';
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

module.exports = { scoreSpeaking, PROMPT_VERSION };


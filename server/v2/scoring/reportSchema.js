const { z } = require('zod');

const weaknessSchema = z.object({
  area: z.string().min(1),
  pattern: z.string().min(1),
  impact: z.string().min(1),
});

const nextStepSchema = z.object({
  focus: z.string().min(1),
  exercise: z.string().min(1),
  success_metric: z.string().min(1),
});

const writingCriteriaSchema = z.object({
  task: z.number().min(0).max(9),
  coherence: z.number().min(0).max(9),
  lexical: z.number().min(0).max(9),
  grammar: z.number().min(0).max(9),
});

const speakingCriteriaSchema = z.object({
  fluency: z.number().min(0).max(9),
  lexical: z.number().min(0).max(9),
  grammar: z.number().min(0).max(9),
  pronunciation: z.number().min(0).max(9),
});

function bandRationaleSchema(criteriaKeys) {
  const shape = {};
  for (const k of criteriaKeys) shape[k] = z.array(z.string().min(1)).min(1);
  return z.object(shape);
}

const deltaSchemaWriting = z.object({
  overall: z.number(),
  criteria: z.object({
    task: z.number(),
    coherence: z.number(),
    lexical: z.number(),
    grammar: z.number(),
  }),
});

const deltaSchemaSpeaking = z.object({
  overall: z.number(),
  criteria: z.object({
    fluency: z.number(),
    lexical: z.number(),
    grammar: z.number(),
    pronunciation: z.number(),
  }),
});

const writingReportSchema = z.object({
  overall_band: z.number().min(0).max(9),
  criteria: writingCriteriaSchema,
  confidence: z.number().min(0).max(1),
  band_rationale: bandRationaleSchema(['task', 'coherence', 'lexical', 'grammar']),
  top_3_weaknesses: z.array(weaknessSchema).length(3),
  next_steps_7_days: z.array(nextStepSchema).min(1),
  delta_vs_last_attempt: deltaSchemaWriting,
});

const speakingReportSchema = z.object({
  overall_band: z.number().min(0).max(9),
  criteria: speakingCriteriaSchema,
  confidence: z.number().min(0).max(1),
  band_rationale: bandRationaleSchema(['fluency', 'lexical', 'grammar', 'pronunciation']),
  top_3_weaknesses: z.array(weaknessSchema).length(3),
  next_steps_7_days: z.array(nextStepSchema).min(1),
  delta_vs_last_attempt: deltaSchemaSpeaking,
});

module.exports = {
  writingReportSchema,
  speakingReportSchema,
};


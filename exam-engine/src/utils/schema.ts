import { z } from 'zod';

export const TimeLimitsSchema = z.object({
  listening: z.object({
    computerDeliveredMinutes: z.number().int().positive(),
    paperBasedMinutes: z.number().int().positive(),
    paperBasedTransferMinutes: z.number().int().nonnegative(),
    computerCheckMinutes: z.number().int().nonnegative(),
  }),
  readingMinutes: z.number().int().positive(),
  writingMinutes: z.number().int().positive(),
});

export const TestMetadataSchema = z.object({
  title: z.string().min(1),
  modeDefault: z.enum(['computer', 'paper']).default('computer'),
  timeLimits: TimeLimitsSchema,
});

export const QuestionBaseSchema = z.object({
  id: z.number().int().min(1).max(40),
  type: z.string().min(1),
  prompt: z.string().min(1),
  constraints: z.string().optional(),
  explanation: z.string().optional(),
  correctAnswer: z.string().min(1),
});

export const TextEntrySchema = QuestionBaseSchema.extend({
  type: z.enum([
    'listening_form_completion',
    'listening_table_completion',
    'listening_sentence_completion',
    'reading_summary_completion',
    'reading_short_answer',
  ]),
});

export const MultipleChoiceSchema = QuestionBaseSchema.extend({
  type: z.enum(['listening_multiple_choice', 'reading_multiple_choice']),
  options: z.array(z.object({ key: z.string().min(1), text: z.string().min(1) })).min(2),
});

export const MapLabelSchema = QuestionBaseSchema.extend({
  type: z.literal('listening_map_label'),
  options: z.array(z.object({ key: z.string().min(1), text: z.string().min(1) })).min(2),
});

export const MatchingDropdownSchema = QuestionBaseSchema.extend({
  type: z.enum(['listening_matching', 'reading_matching_headings', 'reading_matching_information']),
  options: z.array(z.object({ key: z.string().min(1), text: z.string().min(1) })).min(2),
});

export const TrueFalseNotGivenSchema = QuestionBaseSchema.extend({
  type: z.literal('reading_t_f_ng'),
  options: z.array(z.object({ key: z.string(), text: z.string() })).optional(),
});

export const QuestionSchema = z.discriminatedUnion('type', [
  TextEntrySchema,
  MultipleChoiceSchema,
  MapLabelSchema,
  MatchingDropdownSchema,
  TrueFalseNotGivenSchema,
]);

export const ListeningSectionSchema = z.object({
  title: z.string().min(1),
  instructions: z.string().min(1),
  transcript: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});

export const ReadingPassageSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});

export const WritingSchema = z.object({
  task1: z.object({
    prompt: z.string().min(1),
    datasetText: z.string().min(1),
    modelAnswerBand7: z.string().min(1),
  }),
  task2: z.object({
    prompt: z.string().min(1),
    modelAnswerBand7: z.string().min(1),
  }),
  bandRubricSummary: z.object({
    taskAchievement: z.string().min(1),
    coherenceCohesion: z.string().min(1),
    lexicalResource: z.string().min(1),
    grammar: z.string().min(1),
  }),
});

export const SpeakingSchema = z.object({
  part1: z.object({
    topics: z.array(
      z.object({
        title: z.string().min(1),
        questions: z.array(z.string().min(1)).min(4),
        sampleAnswersBand7: z.array(z.string().min(1)).min(1),
      })
    ).min(2),
  }),
  part2: z.object({
    cueCard: z.string().min(1),
    preparationNotesExample: z.array(z.string().min(1)).min(3),
    sampleAnswerBand7: z.string().min(1),
  }),
  part3: z.object({
    questions: z.array(z.string().min(1)).min(4),
    sampleAnswersBand7: z.array(z.string().min(1)).min(2),
  }),
});

export const AnswerKeysSchema = z.object({
  listening: z.array(z.string().min(1)).length(40),
  reading: z.array(z.string().min(1)).length(40),
});

export const BandGuideSchema = z.object({
  listeningReadingRawToBand: z.array(
    z.object({
      min: z.number().int().min(0).max(40),
      max: z.number().int().min(0).max(40),
      band: z.number(),
    })
  ).min(1),
});

export const ExaminerNotesSchema = z.object({
  commonMistakes: z.array(z.string().min(1)).min(3),
  differentiation: z.array(z.string().min(1)).min(2),
});

export const IELTSAcademicTestSchema = z.object({
  metadata: TestMetadataSchema,
  listening: z.object({
    sections: z.array(ListeningSectionSchema).length(4),
  }),
  reading: z.object({
    passages: z.array(ReadingPassageSchema).length(3),
  }),
  writing: WritingSchema,
  speaking: SpeakingSchema,
  answerKeys: AnswerKeysSchema,
  bandGuide: BandGuideSchema,
  examinerNotes: ExaminerNotesSchema,
});

export type IELTSAcademicTest = z.infer<typeof IELTSAcademicTestSchema>;
export type IELTSQuestion = z.infer<typeof QuestionSchema>;


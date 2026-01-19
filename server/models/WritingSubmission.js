const mongoose = require('mongoose');

const writingSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    essay: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      default: 'B1',
    },
    aiScore: {
      overall: Number,
      taskResponse: Number,
      coherence: Number,
      lexical: Number,
      grammar: Number,
      feedback: String,
      strengths: [String],
      improvements: [String],
      bandLevel: String,
      source: String,
    },
    scoringMeta: {
      source: { type: String },
      model: { type: String },
      promptVersion: { type: String },
      latencyMs: { type: Number },
    },
  },
  { timestamps: true }
);

writingSubmissionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('WritingSubmission', writingSubmissionSchema);




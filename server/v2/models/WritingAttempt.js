const mongoose = require('mongoose');

const writingAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'V2TestSession', required: true },
    promptText: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeLimitSeconds: { type: Number },
    status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress' },
    essay: { type: String },
    clientMeta: { type: Object, default: {} },
    antiCheat: {
      templateRisk: { type: Number, default: 0 }, // 0..1
      notes: { type: [String], default: [] },
    },
    scoreReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'V2ScoreReport' },
  },
  { timestamps: true }
);

writingAttemptSchema.index({ userId: 1, createdAt: -1 });
writingAttemptSchema.index({ sessionId: 1 });

module.exports = mongoose.model('V2WritingAttempt', writingAttemptSchema);


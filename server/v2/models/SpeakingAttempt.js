const mongoose = require('mongoose');

const speakingAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'V2TestSession', required: true },
    cueCardText: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeLimitSeconds: { type: Number },
    status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress' },
    transcript: { type: String },
    audio: {
      storage: { type: String, enum: ['local', 's3'], default: 'local' },
      url: { type: String },
      mimeType: { type: String },
      durationSeconds: { type: Number },
    },
    clientMeta: { type: Object, default: {} },
    scoreReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'V2ScoreReport' },
  },
  { timestamps: true }
);

speakingAttemptSchema.index({ userId: 1, createdAt: -1 });
speakingAttemptSchema.index({ sessionId: 1 });

module.exports = mongoose.model('V2SpeakingAttempt', speakingAttemptSchema);


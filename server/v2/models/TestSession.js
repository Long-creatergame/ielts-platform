const mongoose = require('mongoose');

const testSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mode: { type: String, enum: ['practice', 'mock'], default: 'practice' },
    module: { type: String, enum: ['writing', 'speaking'], required: true },
    timeLimitSeconds: { type: Number },
    promptId: { type: mongoose.Schema.Types.ObjectId, ref: 'V2PromptBank' },
    promptText: { type: String },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    status: { type: String, enum: ['in_progress', 'submitted', 'abandoned'], default: 'in_progress' },
  },
  { timestamps: true }
);

testSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('V2TestSession', testSessionSchema);


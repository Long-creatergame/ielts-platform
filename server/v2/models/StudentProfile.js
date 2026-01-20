const mongoose = require('mongoose');

const weaknessSchema = new mongoose.Schema(
  {
    area: { type: String, required: true }, // coherence/grammar/task/lexical etc
    pattern: { type: String, required: true },
    impact: { type: String, required: true },
    count: { type: Number, default: 1 },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const abilitySnapshotSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    module: { type: String, enum: ['writing', 'speaking'], required: true },
    overallBand: { type: Number, required: true },
    criteria: { type: Object, default: {} },
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    targetBand: { type: Number, default: 7.0 },
    abilityHistory: { type: [abilitySnapshotSchema], default: [] },
    recurringWeaknesses: { type: [weaknessSchema], default: [] },
    plan7Days: { type: Array, default: [] },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

studentProfileSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('V2StudentProfile', studentProfileSchema);


const mongoose = require('mongoose');

const scoreReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    module: { type: String, enum: ['writing', 'speaking'], required: true },
    attemptId: { type: mongoose.Schema.Types.ObjectId, required: true },

    // Repeatability / caching
    inputHash: { type: String, required: true },
    promptVersion: { type: String, required: true },
    model: { type: String },
    temperature: { type: Number },

    report: { type: Object, required: true }, // must conform to required output JSON shape
  },
  { timestamps: true }
);

scoreReportSchema.index({ userId: 1, module: 1, createdAt: -1 });
scoreReportSchema.index({ module: 1, inputHash: 1 }, { unique: true });

module.exports = mongoose.model('V2ScoreReport', scoreReportSchema);


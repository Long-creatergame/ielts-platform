const mongoose = require('mongoose');

const promptBankSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['writing_task2', 'speaking_part2'], required: true },
    title: { type: String, required: true },
    promptText: { type: String, required: true },
    tags: { type: [String], default: [] },
    difficulty: { type: String, enum: ['band6', 'band7', 'band75'], default: 'band7' },
    active: { type: Boolean, default: true },
    source: { type: String, default: 'internal' },
  },
  { timestamps: true }
);

promptBankSchema.index({ type: 1, active: 1 });

module.exports = mongoose.model('V2PromptBank', promptBankSchema);


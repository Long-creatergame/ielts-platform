const mongoose = require('mongoose');

const examSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mode: { type: String, enum: ['cambridge', 'practice'], required: true },
  testId: { type: String, index: true },
  skill: { type: String, enum: ['listening', 'reading', 'writing', 'speaking'], required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  answers: { type: Array, default: [] },
  status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress' }
}, { timestamps: true });

examSessionSchema.index({ userId: 1, mode: 1, skill: 1, status: 1 });

module.exports = mongoose.model('ExamSession', examSessionSchema);



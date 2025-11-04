const mongoose = require('mongoose');

const aiResultSchema = new mongoose.Schema({
  testSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSession', required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  skill: { type: String, enum: ['reading', 'listening', 'writing', 'speaking'], required: true },
  band_overall: { type: Number, min: 0, max: 9 },
  task_achievement: { type: Number, min: 0, max: 9 },
  coherence: { type: Number, min: 0, max: 9 },
  lexical: { type: Number, min: 0, max: 9 },
  grammar: { type: Number, min: 0, max: 9 },
  comments: { type: String },
  rubric_details: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

aiResultSchema.index({ userId: 1, skill: 1 });

module.exports = mongoose.model('AIResult', aiResultSchema);


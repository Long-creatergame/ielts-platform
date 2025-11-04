const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  aiResultId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIResult', required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  skill: { type: String, enum: ['reading', 'listening', 'writing', 'speaking'], required: true },
  summary: { type: String, required: true },
  rubric_details: { type: mongoose.Schema.Types.Mixed },
  suggestion: { type: String },
  improvement_plan: { type: String }
}, { timestamps: true });

feedbackSchema.index({ userId: 1, skill: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);


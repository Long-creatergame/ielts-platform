const mongoose = require('mongoose');

const aiFeedbackSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamSession', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  skill: { type: String, enum: ['listening', 'reading', 'writing', 'speaking'], required: true },
  feedback: { type: String },
  improvementTips: { type: String }
}, { timestamps: true });

aiFeedbackSchema.index({ sessionId: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model('AI_Feedback', aiFeedbackSchema);



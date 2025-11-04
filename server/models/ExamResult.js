const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamSession', required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bandScores: {
    listening: { type: Number, min: 0, max: 9 },
    reading: { type: Number, min: 0, max: 9 },
    writing: { type: Number, min: 0, max: 9 },
    speaking: { type: Number, min: 0, max: 9 }
  },
  overall: { type: Number, min: 0, max: 9 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ExamResult', examResultSchema);



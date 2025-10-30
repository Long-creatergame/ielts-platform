const mongoose = require('mongoose');

const PracticeSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    enum: ['reading', 'writing', 'listening', 'speaking'],
    required: true
  },
  level: {
    type: String,
    default: 'A2'
  },
  bandScore: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  answers: {
    type: mongoose.Schema.Types.Mixed
  },
  type: {
    type: String,
    enum: ['quick-practice', 'focused-practice'],
    default: 'quick-practice'
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PracticeSession', PracticeSessionSchema);



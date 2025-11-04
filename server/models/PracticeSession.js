/**
 * Practice Session Model
 * Stores real-time adaptive practice session data
 */

const mongoose = require('mongoose');

const PracticeSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skill: {
    type: String,
    enum: ['reading', 'listening', 'writing', 'speaking'],
    required: true
  },
  mode: {
    type: String,
    enum: ['academic', 'general'],
    default: 'academic'
  },
  bandEstimate: {
    type: Number,
    default: 5.5,
    min: 0,
    max: 9.0
  },
  currentDifficulty: {
    type: Number,
    default: 5.5,
    min: 4.0,
    max: 8.5
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  aiHints: [{
    type: String
  }],
  performanceHistory: [{
    timestamp: { type: Date, default: Date.now },
    accuracy: Number,
    difficulty: Number,
    questionsCount: Number
  }]
}, {
  timestamps: true
});

// Index for efficient queries
PracticeSessionSchema.index({ userId: 1, skill: 1 });
PracticeSessionSchema.index({ userId: 1, lastUpdated: -1 });

module.exports = mongoose.model('PracticeSession', PracticeSessionSchema);



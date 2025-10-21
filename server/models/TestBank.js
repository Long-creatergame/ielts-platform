const mongoose = require('mongoose');

const testBankSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  skill: {
    type: String,
    required: true,
    enum: ['reading', 'listening', 'writing', 'speaking']
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String
  }],
  duration: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TestBank', testBankSchema);

const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'beginner', 'intermediate', 'advanced'],
    required: true
  },
  skills: {
    reading: {
      questions: [Object],
      duration: Number
    },
    listening: {
      questions: [Object],
      duration: Number
    },
    writing: {
      questions: [Object],
      duration: Number
    },
    speaking: {
      questions: [Object],
      duration: Number
    }
  },
  skillScores: {
    reading: { correct: Number, total: Number },
    listening: { correct: Number, total: Number },
    writing: { correct: Number, total: Number },
    speaking: { correct: Number, total: Number }
  },
  skillBands: {
    reading: mongoose.Schema.Types.Mixed,
    listening: mongoose.Schema.Types.Mixed,
    writing: mongoose.Schema.Types.Mixed,
    speaking: mongoose.Schema.Types.Mixed
  },
  totalBand: {
    type: mongoose.Schema.Types.Mixed, // Allow both Number (band score) and String (level like A1, B1, C1)
    required: true
  },
  answers: {
    type: Object,
    default: {}
  },
  paid: {
    type: Boolean,
    default: false
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  resultLocked: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    default: 0
  },
  feedbackUnlocked: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: String,
    default: ''
  },
  coachMessage: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  dateTaken: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Test', testSchema);
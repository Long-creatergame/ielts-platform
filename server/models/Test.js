const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    enum: ['listening', 'reading', 'writing', 'speaking'],
    required: true
  },
  answers: [{
    content: {
      type: String,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  score: {
    overall: {
      type: Number,
      min: 0,
      max: 9
    },
    task: {
      type: Number,
      min: 0,
      max: 9
    },
    coherence: {
      type: Number,
      min: 0,
      max: 9
    },
    lexical: {
      type: Number,
      min: 0,
      max: 9
    },
    grammar: {
      type: Number,
      min: 0,
      max: 9
    }
  },
  aiFeedback: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'scored', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for better query performance
testSchema.index({ userId: 1, skill: 1, createdAt: -1 });

module.exports = mongoose.model('Test', testSchema);


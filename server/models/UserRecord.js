const mongoose = require('mongoose');

const userRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ieltsItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IELTSItem',
    required: true,
    index: true
  },
  score: {
    type: Number,
    min: 0,
    max: 9.0,
    required: true
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    required: true
    // Structure varies by type
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  feedback: {
    type: String,
    default: ''
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  metadata: {
    bandScore: Number,
    skillBreakdown: {
      type: Map,
      of: Number
    },
    aiFeedback: String,
    improvementAreas: [String]
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate submissions
userRecordSchema.index({ userId: 1, ieltsItemId: 1 }, { unique: true });

// Index for user history queries
userRecordSchema.index({ userId: 1, submittedAt: -1 });

module.exports = mongoose.model('UserRecord', userRecordSchema);


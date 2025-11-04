/**
 * Emotion Feedback Model
 * Stores emotion feedback data for users
 */

const mongoose = require('mongoose');

const emotionFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    index: true
  },
  emotion: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  tone: {
    type: String,
    enum: ['supportive', 'uplifting', 'motivating', 'encouraging', 'neutral'],
    default: 'neutral'
  },
  context: {
    type: String,
    default: 'learning'
  },
  message: String,
  performanceData: {
    accuracy: Number,
    bandChange: Number,
    streak: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
emotionFeedbackSchema.index({ userId: 1, createdAt: -1 });
emotionFeedbackSchema.index({ testId: 1 });

module.exports = mongoose.model('EmotionFeedback', emotionFeedbackSchema);


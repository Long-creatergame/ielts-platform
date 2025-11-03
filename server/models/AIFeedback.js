/**
 * AI Feedback Model
 * Stores detailed AI-generated feedback for Writing and Speaking tests
 */

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  skill: {
    type: String,
    enum: ['writing', 'speaking'],
    required: true
  },
  bandBreakdown: {
    Grammar: { type: Number, default: 0 },
    Vocabulary: { type: Number, default: 0 },
    Coherence: { type: Number, default: 0 },
    Task: { type: Number, default: 0 },
    // Speaking-specific fields
    Fluency: { type: Number, default: 0 },
    Pronunciation: { type: Number, default: 0 }
  },
  feedback: [{
    error: String,
    suggestion: String,
    reason: String,
    type: String, // grammar/vocab/coherence/task/fluency/pronunciation
    wordIndex: Number,
    wordIndices: [Number]
  }],
  // Store full text/transcript for reference
  text: String,
  transcript: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
feedbackSchema.index({ userId: 1, testId: 1, skill: 1 });

const AIFeedback = mongoose.models.AIFeedback || mongoose.model('AIFeedback', feedbackSchema);

module.exports = AIFeedback;


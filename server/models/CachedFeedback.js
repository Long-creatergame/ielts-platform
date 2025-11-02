/**
 * Cached Feedback Model
 * Stores AI-generated writing feedback to reduce OpenAI API costs
 */

const mongoose = require('mongoose');

const cachedFeedbackSchema = new mongoose.Schema({
  // Hash of the essay text to identify duplicates
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // The full AI feedback object
  feedback: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Track usage to identify popular essays
  usageCount: {
    type: Number,
    default: 1
  },
  
  // Last time this feedback was requested
  lastUsed: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for faster lookups
cachedFeedbackSchema.index({ hash: 1 });

// TTL index: Auto-delete after 6 months (15552000 seconds)
cachedFeedbackSchema.index({ lastUsed: 1 }, { expireAfterSeconds: 15552000 });

const CachedFeedback = mongoose.model('CachedFeedback', cachedFeedbackSchema);

// Log when schema loads
console.log('[MongoDB] CachedFeedback schema loaded with 6-month TTL');

module.exports = CachedFeedback;

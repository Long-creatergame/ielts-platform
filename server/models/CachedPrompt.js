/**
 * Cached Prompt Model
 * Stores AI-generated test prompts to reduce OpenAI API costs
 * Each prompt can be distributed to multiple users
 */

const mongoose = require('mongoose');

const cachedPromptSchema = new mongoose.Schema({
  skill: {
    type: String,
    enum: ['reading', 'writing', 'listening', 'speaking'],
    required: true,
    index: true
  },
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true,
    index: true
  },
  topic: {
    type: String,
    default: 'General English',
    index: true
  },
  questionSet: [{
    taskType: String,
    question: String,
    options: [String], // For multiple choice questions
    correctAnswer: mongoose.Schema.Types.Mixed // Can be String or Number
  }],
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  metadata: {
    aiModel: String,
    tokensUsed: Number,
    generatedAt: Date
  }
}, {
  timestamps: true
});

// Compound index for efficient lookups
cachedPromptSchema.index({ skill: 1, level: 1, topic: 1 });

// TTL index: auto-delete after 6 months (15552000 seconds)
cachedPromptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 });

// Additional indexes for performance
cachedPromptSchema.index({ 'usedBy': 1 });
cachedPromptSchema.index({ usageCount: -1 });

module.exports = mongoose.model('CachedPrompt', cachedPromptSchema);

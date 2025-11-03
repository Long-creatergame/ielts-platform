/**
 * Motivation Model
 * Tracks user motivation, streaks, and AI-generated encouragement
 */

const mongoose = require('mongoose');

const motivationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  lastBandUpdate: Number,
  motivationLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  preferredTone: {
    type: String,
    enum: ['encouraging', 'mentor', 'challenging'],
    default: 'encouraging'
  },
  streakDays: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: {
      type: String,
      enum: ['consistency', 'improvement', 'milestone', 'mastery']
    },
    title: String,
    description: String,
    date: Date,
    badge: String
  }],
  messagesHistory: [{
    message: String,
    type: {
      type: String,
      enum: ['daily', 'weekly', 'celebration', 'reminder', 'encouragement']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  weeklyProgress: {
    testsCompleted: Number,
    avgImprovement: Number,
    strongestSkill: String,
    weakestSkill: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for quick lookups
motivationSchema.index({ userId: 1 });
motivationSchema.index({ lastActive: 1 });

// Auto-update updatedAt
motivationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Motivation = mongoose.models.Motivation || mongoose.model('Motivation', motivationSchema);

module.exports = Motivation;


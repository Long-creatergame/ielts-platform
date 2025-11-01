/**
 * User Preferences Model
 * Stores user's personalized learning preferences for AI-generated content
 */

const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Learning preferences
  tone: {
    type: String,
    enum: ['formal', 'casual', 'academic', 'business'],
    default: 'academic'
  },
  
  focusSkills: [{
    type: String,
    enum: ['reading', 'writing', 'listening', 'speaking']
  }],
  
  topics: [{
    type: String
  }],
  
  // Goal settings
  targetBand: {
    type: Number,
    min: 0,
    max: 9,
    default: 6.5
  },
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'adaptive'],
    default: 'adaptive'
  },
  
  // Time preferences
  practiceTimePerDay: {
    type: Number, // minutes
    default: 45
  },
  
  preferredTestLength: {
    type: String,
    enum: ['short', 'medium', 'full'],
    default: 'full'
  },
  
  // AI preferences
  aiStyle: {
    type: String,
    enum: ['concise', 'detailed', 'encouraging', 'critical'],
    default: 'encouraging'
  },
  
  // Notification preferences
  dailyReminder: {
    type: Boolean,
    default: true
  },
  
  weeklyReport: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster lookups
userPreferencesSchema.index({ userId: 1 });

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);

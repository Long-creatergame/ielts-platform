const mongoose = require('mongoose');

const aiPersonalizationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Learning Style & Preferences
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
    default: 'visual'
  },
  
  preferredDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'adaptive'],
    default: 'adaptive'
  },
  
  studyTimePreference: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    default: 'evening'
  },
  
  // AI-Generated Learning Profile
  aiProfile: {
    strengths: [{
      skill: String, // 'reading', 'writing', 'listening', 'speaking'
      level: Number, // 0-9 band score
      confidence: Number, // 0-1
      lastUpdated: Date
    }],
    
    weaknesses: [{
      skill: String,
      level: Number,
      priority: String, // 'high', 'medium', 'low'
      improvementAreas: [String],
      lastUpdated: Date
    }],
    
    learningPatterns: {
      bestPerformingTopics: [String],
      challengingTopics: [String],
      optimalQuestionTypes: [String],
      timeSpentPerSkill: {
        reading: Number,
        writing: Number,
        listening: Number,
        speaking: Number
      }
    }
  },
  
  // AI-Generated Recommendations
  recommendations: [{
    type: String, // 'practice', 'study', 'review', 'challenge'
    skill: String,
    priority: String,
    title: String,
    description: String,
    actionItems: [String],
    estimatedTime: Number, // minutes
    difficulty: String,
    createdAt: Date,
    completedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending'
    }
  }],
  
  // AI Progress Tracking
  progressHistory: [{
    date: Date,
    skill: String,
    score: Number,
    timeSpent: Number, // minutes
    questionsAnswered: Number,
    accuracy: Number,
    improvement: Number // compared to previous session
  }],
  
  // AI Adaptive Learning
  adaptiveSettings: {
    questionDifficultyAdjustment: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    },
    
    personalizedPrompts: {
      motivationalMessages: [String],
      studyReminders: [String],
      progressCelebrations: [String]
    },
    
    aiCoaching: {
      enabled: Boolean,
      frequency: String, // 'daily', 'weekly', 'monthly'
      lastCoachingSession: Date,
      coachingStyle: String // 'encouraging', 'direct', 'detailed'
    }
  },
  
  // AI-Generated Content Preferences
  contentPreferences: {
    preferredQuestionTypes: [String],
    preferredTopics: [String],
    preferredDifficultyLevel: String,
    preferredTimeOfDay: String,
    preferredStudyDuration: Number // minutes
  },
  
  // AI Learning Analytics
  learningAnalytics: {
    totalStudyTime: Number, // minutes
    averageSessionLength: Number, // minutes
    consistencyScore: Number, // 0-1
    improvementRate: Number, // per week
    predictedBandScore: Number,
    confidenceLevel: Number, // 0-1
    lastAnalyzed: Date
  },
  
  // AI Personalization Status
  personalizationStatus: {
    isInitialized: Boolean,
    lastUpdated: Date,
    version: String,
    aiModelVersion: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
aiPersonalizationSchema.index({ userId: 1 });
aiPersonalizationSchema.index({ 'aiProfile.strengths.skill': 1 });
aiPersonalizationSchema.index({ 'aiProfile.weaknesses.skill': 1 });
aiPersonalizationSchema.index({ 'recommendations.status': 1 });
aiPersonalizationSchema.index({ 'progressHistory.date': -1 });

module.exports = mongoose.model('AIPersonalization', aiPersonalizationSchema);

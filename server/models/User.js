const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  goal: {
    type: String,
    enum: ['Du học', 'Định cư', 'Việc làm', 'Thử sức'],
    default: 'Thử sức'
  },
  targetBand: {
    type: Number,
    min: 4.0,
    max: 9.0,
    default: 6.5
  },
  currentLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A2'
  },
  testsTaken: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }],
  streakDays: {
    type: Number,
    default: 0
  },
  totalTests: {
    type: Number,
    default: 0
  },
  averageBand: {
    type: Number,
    default: 0
  },
  paid: {
    type: Boolean,
    default: false
  },
  freeTestsUsed: {
    type: Number,
    default: 0
  },
  freeTestsLimit: {
    type: Number,
    default: 3  // Tăng từ 1 lên 3 test miễn phí
  },
  // Track daily usage for limited features
  aiPracticeUsedToday: {
    type: Number,
    default: 0
  },
  lastAiPracticeDate: {
    type: Date,
    default: null
  },
  // Track feature usage
  featureUsage: {
    weaknessAnalysis: { type: Number, default: 0 },
    aiPersonalization: { type: Number, default: 0 },
    advancedRecommendations: { type: Number, default: 0 }
  },
  subscriptionPlan: {
    type: String,
    enum: ["free", "standard", "premium", "ultimate"],
    default: "free"
  },
  subscriptionExpires: {
    type: Date,
    default: null
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  milestones: {
    type: Map,
    of: Date,
    default: {}
  },
  points: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  notifications: [{
    id: String,
    type: String,
    title: String,
    message: String,
    data: mongoose.Schema.Types.Mixed,
    read: { type: Boolean, default: false },
    readAt: Date,
    createdAt: { type: Date, default: Date.now }
  }],
  aiRecommendations: [{
    skill: String,
    recommendations: Array,
    generatedAt: Date,
    expiresAt: Date
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
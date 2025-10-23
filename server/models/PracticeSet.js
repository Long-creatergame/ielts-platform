import mongoose from 'mongoose';

const practiceSetSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  skill: {
    type: String,
    required: true,
    enum: ['writing', 'speaking', 'reading', 'listening']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  estimatedTime: {
    type: String,
    required: true
  },
  focusAreas: [{
    type: String,
    enum: ['grammar', 'lexical', 'coherence', 'pronunciation']
  }],
  question: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  wordLimit: {
    type: Number,
    default: 250
  },
  timeLimit: {
    type: Number,
    default: 60
  },
  band_level: {
    type: Number,
    min: 4,
    max: 9,
    default: 6.5
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'skipped'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  },
  ai_generated: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
practiceSetSchema.index({ user_id: 1, skill: 1 });
practiceSetSchema.index({ user_id: 1, status: 1 });
practiceSetSchema.index({ created_at: -1 });

// Method to mark as completed
practiceSetSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to mark as in progress
practiceSetSchema.methods.markInProgress = function() {
  this.status = 'in_progress';
  return this.save();
};

// Method to skip practice
practiceSetSchema.methods.skip = function() {
  this.status = 'skipped';
  return this.save();
};

// Static method to get user's practice sets
practiceSetSchema.statics.getUserPractices = async function(userId, skill = null, status = null) {
  const query = { user_id: userId };
  if (skill) query.skill = skill;
  if (status) query.status = status;
  
  return await this.find(query).sort({ created_at: -1 });
};

// Static method to get pending practices
practiceSetSchema.statics.getPendingPractices = async function(userId) {
  return await this.find({ 
    user_id: userId, 
    status: 'pending' 
  }).sort({ created_at: -1 });
};

// Static method to create new practice set
practiceSetSchema.statics.createPractice = async function(userId, practiceData) {
  const practice = new this({
    user_id: userId,
    ...practiceData
  });
  
  return await practice.save();
};

export default mongoose.model('PracticeSet', practiceSetSchema);

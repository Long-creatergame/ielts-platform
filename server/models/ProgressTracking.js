import mongoose from 'mongoose';

const progressTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skill: {
    type: String,
    enum: ['reading', 'writing', 'listening', 'speaking'],
    required: true
  },
  recommendationId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['started', 'in_progress', 'completed', 'paused'],
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  progressPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  notes: {
    type: String,
    maxlength: 500
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  expectedImprovement: {
    type: String,
    required: true
  },
  actualImprovement: {
    type: Number, // band score improvement
    default: 0
  },
  resources: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['book', 'video', 'exercise', 'practice_test', 'other']
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  milestones: [{
    title: String,
    description: String,
    targetDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  feedback: {
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    userComment: String,
    aiFeedback: String
  },
  nextSteps: [{
    action: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    deadline: Date
  }]
}, {
  timestamps: true
});

// Indexes for better performance
progressTrackingSchema.index({ userId: 1, skill: 1 });
progressTrackingSchema.index({ userId: 1, completed: 1 });
progressTrackingSchema.index({ createdAt: -1 });

// Static methods
progressTrackingSchema.statics.getUserProgress = async function(userId, skill = null) {
  const query = { userId };
  if (skill) query.skill = skill;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('userId', 'name email');
};

progressTrackingSchema.statics.getProgressStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$skill',
        totalRecommendations: { $sum: 1 },
        completedRecommendations: {
          $sum: { $cond: ['$completed', 1, 0] }
        },
        averageProgress: { $avg: '$progressPercentage' },
        totalTimeSpent: { $sum: '$timeSpent' },
        averageImprovement: { $avg: '$actualImprovement' }
      }
    }
  ]);
  
  return stats;
};

progressTrackingSchema.statics.getRecommendationEffectiveness = async function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          skill: '$skill',
          difficulty: '$difficulty'
        },
        totalUsers: { $sum: 1 },
        averageImprovement: { $avg: '$actualImprovement' },
        completionRate: {
          $avg: { $cond: ['$completed', 1, 0] }
        }
      }
    },
    {
      $sort: { averageImprovement: -1 }
    }
  ]);
};

// Instance methods
progressTrackingSchema.methods.updateProgress = function(progressData) {
  Object.assign(this, progressData);
  return this.save();
};

progressTrackingSchema.methods.addMilestone = function(milestone) {
  this.milestones.push(milestone);
  return this.save();
};

progressTrackingSchema.methods.completeMilestone = function(milestoneId) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    milestone.completed = true;
    milestone.completedAt = new Date();
  }
  return this.save();
};

progressTrackingSchema.methods.addResource = function(resource) {
  this.resources.push(resource);
  return this.save();
};

progressTrackingSchema.methods.completeResource = function(resourceId) {
  const resource = this.resources.id(resourceId);
  if (resource) {
    resource.completed = true;
  }
  return this.save();
};

export default mongoose.model('ProgressTracking', progressTrackingSchema);

const mongoose = require('mongoose');

const weaknessProfileSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  weakness: {
    grammar: {
      type: Number,
      default: 0,
      min: 0,
      max: 9
    },
    lexical: {
      type: Number,
      default: 0,
      min: 0,
      max: 9
    },
    coherence: {
      type: Number,
      default: 0,
      min: 0,
      max: 9
    },
    pronunciation: {
      type: Number,
      default: 0,
      min: 0,
      max: 9
    }
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  total_submissions: {
    type: Number,
    default: 0
  },
  improvement_trend: {
    type: String,
    enum: ['improving', 'stable', 'declining'],
    default: 'stable'
  }
}, {
  timestamps: true
});

// Index for efficient queries
weaknessProfileSchema.index({ user_id: 1 }, { unique: true });
weaknessProfileSchema.index({ last_updated: -1 });

// Method to update weakness profile
weaknessProfileSchema.methods.updateWeakness = function(newBreakdown) {
  const oldWeakness = { ...this.weakness };
  
  // Update weakness scores (weighted average)
  this.weakness.grammar = this.calculateWeightedAverage(oldWeakness.grammar, newBreakdown.grammar);
  this.weakness.lexical = this.calculateWeightedAverage(oldWeakness.lexical, newBreakdown.lexical);
  this.weakness.coherence = this.calculateWeightedAverage(oldWeakness.coherence, newBreakdown.coherence);
  this.weakness.pronunciation = this.calculateWeightedAverage(oldWeakness.pronunciation, newBreakdown.pronunciation);
  
  this.last_updated = new Date();
  this.total_submissions += 1;
  
  // Determine improvement trend
  this.improvement_trend = this.calculateImprovementTrend(oldWeakness, this.weakness);
  
  return this.save();
};

// Helper method to calculate weighted average
weaknessProfileSchema.methods.calculateWeightedAverage = function(oldValue, newValue) {
  const weight = Math.min(this.total_submissions / 10, 0.8); // More weight to recent scores
  return (oldValue * weight + newValue * (1 - weight)).toFixed(1);
};

// Helper method to calculate improvement trend
weaknessProfileSchema.methods.calculateImprovementTrend = function(oldWeakness, newWeakness) {
  const oldAverage = (oldWeakness.grammar + oldWeakness.lexical + oldWeakness.coherence + oldWeakness.pronunciation) / 4;
  const newAverage = (newWeakness.grammar + newWeakness.lexical + newWeakness.coherence + newWeakness.pronunciation) / 4;
  
  if (newAverage > oldAverage + 0.5) return 'improving';
  if (newAverage < oldAverage - 0.5) return 'declining';
  return 'stable';
};

// Static method to get user's weakness profile
weaknessProfileSchema.statics.getUserWeakness = async function(userId) {
  return await this.findOne({ user_id: userId });
};

// Static method to create or update weakness profile
weaknessProfileSchema.statics.updateUserWeakness = async function(userId, breakdown) {
  let profile = await this.findOne({ user_id: userId });
  
  if (!profile) {
    profile = new this({
      user_id: userId,
      weakness: breakdown
    });
  } else {
    await profile.updateWeakness(breakdown);
  }
  
  return profile;
};

module.exports = mongoose.model('WeaknessProfile', weaknessProfileSchema);

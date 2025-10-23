import mongoose from 'mongoose';

const aiSubmissionSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  skill: {
    type: String,
    required: true,
    enum: ['writing', 'speaking', 'reading', 'listening']
  },
  submission_text: {
    type: String,
    required: true
  },
  audio_url: {
    type: String
  },
  ai_analysis: {
    band_estimate: {
      type: Number,
      required: true,
      min: 0,
      max: 9
    },
    breakdown: {
      grammar: {
        type: Number,
        required: true,
        min: 0,
        max: 9
      },
      lexical: {
        type: Number,
        required: true,
        min: 0,
        max: 9
      },
      coherence: {
        type: Number,
        required: true,
        min: 0,
        max: 9
      },
      pronunciation: {
        type: Number,
        required: true,
        min: 0,
        max: 9
      }
    },
    feedback: [{
      type: String
    }],
    suggestions: [{
      type: String
    }]
  },
  weakness_updated: {
    type: Boolean,
    default: false
  },
  practice_recommendations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeSet'
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
aiSubmissionSchema.index({ user_id: 1, skill: 1 });
aiSubmissionSchema.index({ user_id: 1, created_at: -1 });
aiSubmissionSchema.index({ 'ai_analysis.band_estimate': 1 });

// Method to get average band score for user
aiSubmissionSchema.statics.getUserAverageBand = async function(userId, skill = null) {
  const query = { user_id: userId };
  if (skill) query.skill = skill;
  
  const result = await this.aggregate([
    { $match: query },
    { $group: { 
      _id: null, 
      averageBand: { $avg: '$ai_analysis.band_estimate' },
      count: { $sum: 1 }
    }}
  ]);
  
  return result[0] || { averageBand: 0, count: 0 };
};

// Method to get user's progress over time
aiSubmissionSchema.statics.getUserProgress = async function(userId, skill = null, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const query = { 
    user_id: userId,
    created_at: { $gte: startDate }
  };
  if (skill) query.skill = skill;
  
  return await this.find(query)
    .sort({ created_at: 1 })
    .select('ai_analysis.band_estimate created_at skill');
};

// Method to get user's weakest areas
aiSubmissionSchema.statics.getUserWeakestAreas = async function(userId, limit = 5) {
  const result = await this.aggregate([
    { $match: { user_id: userId } },
    { $project: {
      skill: 1,
      grammar: '$ai_analysis.breakdown.grammar',
      lexical: '$ai_analysis.breakdown.lexical',
      coherence: '$ai_analysis.breakdown.coherence',
      pronunciation: '$ai_analysis.breakdown.pronunciation'
    }},
    { $group: {
      _id: '$skill',
      avgGrammar: { $avg: '$grammar' },
      avgLexical: { $avg: '$lexical' },
      avgCoherence: { $avg: '$coherence' },
      avgPronunciation: { $avg: '$pronunciation' }
    }},
    { $sort: { avgGrammar: 1, avgLexical: 1, avgCoherence: 1, avgPronunciation: 1 }},
    { $limit: limit }
  ]);
  
  return result;
};

// Method to mark weakness as updated
aiSubmissionSchema.methods.markWeaknessUpdated = function() {
  this.weakness_updated = true;
  return this.save();
};

// Method to add practice recommendations
aiSubmissionSchema.methods.addPracticeRecommendations = function(practiceIds) {
  this.practice_recommendations = practiceIds;
  return this.save();
};

export default mongoose.model('AISubmission', aiSubmissionSchema);

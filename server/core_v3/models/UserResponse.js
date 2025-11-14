const mongoose = require('mongoose');
const { getMongooseCore } = require('../config/db');

function getModelConnection() {
  try {
    return getMongooseCore();
  } catch (error) {
    throw new Error('[Core V3 UserResponse] Database connection not established. Call connectCoreDB() first.');
  }
}

const userResponseSchema = new (getModelConnection().Schema)({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  assignmentId: {
    type: String,
    index: true,
  },
  ieltsItemId: {
    type: String,
    required: true,
    index: true,
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true,
  },
  score: {
    type: Number,
    min: 0,
    max: 9,
  },
  bandScore: {
    type: Number,
    min: 0,
    max: 9,
  },
  feedback: {
    type: Map,
    of: String,
    default: {},
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  timeSpent: {
    type: Number, // in seconds
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes
userResponseSchema.index({ userId: 1, submittedAt: -1 });
userResponseSchema.index({ ieltsItemId: 1 });
userResponseSchema.index({ assignmentId: 1 });
userResponseSchema.index({ score: -1 });

function getUserResponseModel() {
  const mongooseCore = getModelConnection();
  return mongooseCore.models.UserResponse || mongooseCore.model('UserResponse', userResponseSchema);
}

const UserResponse = getUserResponseModel();
module.exports = UserResponse;


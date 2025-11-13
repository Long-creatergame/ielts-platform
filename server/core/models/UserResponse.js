const mongoose = require('mongoose');
let coreDB = null;

function getModelConnection() {
  if (!coreDB) {
    const { getCoreConnection } = require('../config/db');
    coreDB = getCoreConnection();
  }
  return coreDB;
}

/**
 * UserResponse Model - Stores user responses to IELTS items
 */
const userResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCore',
    required: true,
    index: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IELTSItem',
    required: true,
    index: true
  },
  assignedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssignedItem',
    index: true
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  bandScore: {
    type: Number,
    min: 0,
    max: 9,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  feedback: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  corrections: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'userresponses'
});

// Indexes
userResponseSchema.index({ userId: 1, submittedAt: -1 });
userResponseSchema.index({ itemId: 1 });
userResponseSchema.index({ userId: 1, itemId: 1 });
userResponseSchema.index({ isCompleted: 1, submittedAt: -1 });
userResponseSchema.index({ bandScore: -1 });

function getUserResponseModel() {
  return getModelConnection().model('UserResponse', userResponseSchema);
}

const UserResponse = getUserResponseModel();

module.exports = UserResponse;


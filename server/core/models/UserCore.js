const mongoose = require('mongoose');
const { getCoreConnection } = require('../config/db');

const coreDB = getCoreConnection();

/**
 * UserCore Model - Core V3 User Schema
 * Isolated from main User model
 */
const userCoreSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'teacher'],
    default: 'student',
    index: true
  },
  currentLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'B1'
  },
  targetBand: {
    type: Number,
    min: 0,
    max: 9,
    default: 6.5
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLogin: {
    type: Date
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'usercores'
});

// Indexes
userCoreSchema.index({ email: 1 });
userCoreSchema.index({ role: 1, isActive: 1 });
userCoreSchema.index({ createdAt: -1 });

// Methods
userCoreSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

function getUserCoreModel() {
  return getModelConnection().model('UserCore', userCoreSchema);
}

const UserCore = getUserCoreModel();

module.exports = UserCore;


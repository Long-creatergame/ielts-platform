const mongoose = require('mongoose');
const { getCoreConnection } = require('../config/db');

const coreDB = getCoreConnection();

/**
 * IELTSItem Model - Core V3 IELTS Test Items
 */
const ieltsItemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['reading', 'listening', 'writing', 'speaking'],
    index: true
  },
  skill: {
    type: String,
    required: true,
    enum: ['reading', 'listening', 'writing', 'speaking'],
    index: true
  },
  level: {
    type: String,
    required: true,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    index: true
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  questions: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  instructions: {
    type: String,
    trim: true
  },
  timeLimit: {
    type: Number, // in minutes
    default: 60
  },
  points: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  usageCount: {
    type: Number,
    default: 0,
    index: true
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'ieltsitems'
});

// Indexes
ieltsItemSchema.index({ type: 1, skill: 1, level: 1 });
ieltsItemSchema.index({ isActive: 1, difficulty: 1 });
ieltsItemSchema.index({ topic: 1, tags: 1 });
ieltsItemSchema.index({ createdAt: -1 });
ieltsItemSchema.index({ usageCount: -1 });

const IELTSItem = coreDB.model('IELTSItem', ieltsItemSchema);

module.exports = IELTSItem;


const mongoose = require('mongoose');
const { getCoreConnection } = require('../config/db');

const coreDB = getCoreConnection();

/**
 * AssignedItem Model - Tracks items assigned to users
 */
const assignedItemSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['assigned', 'in_progress', 'completed', 'skipped'],
    default: 'assigned',
    index: true
  },
  assignedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  dueDate: {
    type: Date,
    index: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  notes: {
    type: String,
    trim: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'assigneditems'
});

// Indexes
assignedItemSchema.index({ userId: 1, status: 1 });
assignedItemSchema.index({ userId: 1, assignedAt: -1 });
assignedItemSchema.index({ itemId: 1 });
assignedItemSchema.index({ dueDate: 1 });
assignedItemSchema.index({ userId: 1, itemId: 1 }, { unique: true });

const AssignedItem = coreDB.model('AssignedItem', assignedItemSchema);

module.exports = AssignedItem;


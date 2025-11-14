const { getMongooseCore } = require('../config/db');

function getModelConnection() {
  try {
    return getMongooseCore();
  } catch (error) {
    throw new Error('[Core V3 Assignment] Database connection not established. Call connectCoreDB() first.');
  }
}

const assignmentSchema = new (getModelConnection().Schema)({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  ieltsItemId: {
    type: String,
    required: true,
    index: true,
  },
  assignedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  dueDate: {
    type: Date,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'expired'],
    default: 'pending',
    index: true,
  },
  completedAt: {
    type: Date,
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
assignmentSchema.index({ userId: 1, status: 1 });
assignmentSchema.index({ ieltsItemId: 1 });
assignmentSchema.index({ assignedAt: -1 });
assignmentSchema.index({ dueDate: 1 });

function getAssignmentModel() {
  const mongooseCore = getModelConnection();
  return mongooseCore.models.Assignment || mongooseCore.model('Assignment', assignmentSchema);
}

const Assignment = getAssignmentModel();
module.exports = Assignment;


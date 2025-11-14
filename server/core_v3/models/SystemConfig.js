const mongoose = require('mongoose');
const { getMongooseCore } = require('../config/db');

function getModelConnection() {
  try {
    return getMongooseCore();
  } catch (error) {
    throw new Error('[Core V3 SystemConfig] Database connection not established. Call connectCoreDB() first.');
  }
}

const systemConfigSchema = new (getModelConnection().Schema)({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  category: {
    type: String,
    enum: ['system', 'feature', 'ui', 'ai', 'payment', 'other'],
    default: 'system',
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
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
systemConfigSchema.index({ key: 1 });
systemConfigSchema.index({ category: 1, isActive: 1 });

function getSystemConfigModel() {
  const mongooseCore = getModelConnection();
  return mongooseCore.models.SystemConfig || mongooseCore.model('SystemConfig', systemConfigSchema);
}

const SystemConfig = getSystemConfigModel();
module.exports = SystemConfig;


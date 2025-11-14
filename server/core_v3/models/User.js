const { getMongooseCore } = require('../config/db');

// Lazy-load mongoose connection
function getModelConnection() {
  try {
    return getMongooseCore();
  } catch (error) {
    throw new Error('[Core V3 User] Database connection not established. Call connectCoreDB() first.');
  }
}

const userSchema = new (getModelConnection().Schema)({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'teacher'],
    default: 'student',
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  profile: {
    targetBand: { type: Number, min: 0, max: 9 },
    currentLevel: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
    preferredSkills: [{ type: String }],
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
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Methods
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

function getUserModel() {
  const mongooseCore = getModelConnection();
  return mongooseCore.models.User || mongooseCore.model('User', userSchema);
}

const User = getUserModel();
module.exports = User;


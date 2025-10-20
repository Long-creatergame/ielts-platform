const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  isTrialUsed: {
    type: Boolean,
    default: false
  },
  plan: {
    type: String,
    enum: ['trial', 'paid'],
    default: 'trial'
  },
  tests: [{
    skill: {
      type: String,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  payments: [{
    method: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    stripeSessionId: {
      type: String
    },
    paidAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);

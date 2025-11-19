const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    goal: {
      type: Number,
      default: 0,
    },
    targetBand: {
      type: Number,
      min: 4.0,
      max: 9.0,
      default: 6.5,
    },
    currentLevel: {
      type: String,
      enum: ['A2', 'B1', 'B2', 'C1', 'C2'],
      default: 'B1',
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (typeof this.password === 'string' && this.password.startsWith('$2')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
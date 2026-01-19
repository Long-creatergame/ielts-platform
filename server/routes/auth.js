const express = require('express');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { isEmailConfigured } = require('../services/emailService');
const {
  register,
  login,
  getUserProfile,
  requestPasswordReset,
  confirmPasswordReset
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

router.use(authLimiter);

const LEVEL_ENUM = ['A2', 'B1', 'B2', 'C1', 'C2'];

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body || {});
    if (!result.success) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.statusCode = 400;
      err.details = result.error.issues.map((issue) => ({
        path: issue.path?.join('.') || 'body',
        message: issue.message,
      }));
      return next(err);
    }
    req.body = result.data;
    return next();
  };
}

const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().trim().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(72, 'Password is too long'),
    goal: z.preprocess((v) => (v === '' || v === undefined || v === null ? undefined : Number(v)), z.number().optional()),
    targetBand: z.preprocess(
      (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
      z.number().min(4).max(9).optional()
    ),
    currentLevel: z.enum(LEVEL_ENUM).optional(),
  })
  .passthrough();

const loginSchema = z
  .object({
    email: z.string().trim().email('Invalid email'),
    password: z.string().min(1, 'Password is required').max(72, 'Password is too long'),
  })
  .passthrough();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', authMiddleware, getUserProfile);

function requireEmailReset(req, res, next) {
  if (!isEmailConfigured()) {
    return res.status(501).json({
      success: false,
      message: 'Password reset email service is not configured',
    });
  }
  return next();
}

router.post('/reset-password/request', requireEmailReset, requestPasswordReset);
router.post('/reset-password/confirm', confirmPasswordReset);

// Update user profile (basic fields)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, targetBand, currentLevel } = req.body || {};
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (targetBand) user.targetBand = targetBand;
    if (currentLevel) user.currentLevel = currentLevel;
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetBand: user.targetBand,
        currentLevel: user.currentLevel,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
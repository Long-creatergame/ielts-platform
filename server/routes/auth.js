const express = require('express');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const crypto = require('crypto');
const { isEmailConfigured, sendEmailVerification } = require('../services/emailService');
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

const resendSchema = z
  .object({
    email: z.string().trim().email('Invalid email'),
  })
  .passthrough();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', authMiddleware, getUserProfile);

router.get('/verify-email', async (req, res) => {
  try {
    const token = String(req.query?.token || '').trim();
    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing token' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerifyTokenHash: tokenHash,
      emailVerifyTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.emailVerified = true;
    user.emailVerifyTokenHash = undefined;
    user.emailVerifyTokenExpiresAt = undefined;
    await user.save();

    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ success: false, message: 'Unable to verify email right now.' });
  }
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

router.post('/resend-verification', resendLimiter, validateBody(resendSchema), async (req, res) => {
  try {
    // Avoid account enumeration: always return success-ish message.
    const email = String(req.body?.email || '').toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a verification email has been sent.' });
    }
    if (user.emailVerified) {
      return res.json({ success: true, message: 'Email is already verified.' });
    }

    if (!isEmailConfigured() || !(process.env.APP_BASE_URL || process.env.FRONTEND_URL || process.env.CLIENT_URL)) {
      return res.status(501).json({
        success: false,
        message: 'Email verification service is not configured',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.emailVerifyTokenHash = tokenHash;
    user.emailVerifyTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const base = String(process.env.APP_BASE_URL || process.env.FRONTEND_URL || process.env.CLIENT_URL).replace(/\/+$/, '');
    const verifyUrl = `${base}/verify-email?token=${rawToken}`;
    await sendEmailVerification(user.email, verifyUrl);

    return res.json({ success: true, message: 'If that email exists, a verification email has been sent.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ success: false, message: 'Unable to resend verification email right now.' });
  }
});

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
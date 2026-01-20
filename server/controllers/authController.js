const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordReset, sendEmailVerification, isEmailConfigured } = require('../services/emailService');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  return process.env.JWT_SECRET;
};

const generateToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });

function getAppBaseUrl() {
  const base = process.env.APP_BASE_URL || process.env.FRONTEND_URL || process.env.CLIENT_URL || '';
  return String(base).replace(/\/+$/, '');
}

function buildVerifyEmailUrl(rawToken) {
  const base = getAppBaseUrl();
  return `${base}/verify-email?token=${rawToken}`;
}

function buildResetPasswordUrl(rawToken, email) {
  const base = getAppBaseUrl();
  return `${base}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
}

async function issueEmailVerification(user) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.emailVerifyTokenHash = tokenHash;
  user.emailVerifyTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verifyUrl = buildVerifyEmailUrl(rawToken);
  await sendEmailVerification(user.email, verifyUrl);
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, goal, targetBand, currentLevel } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    if (await User.findOne({ email: String(email).toLowerCase() })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const numericGoal = Number(goal) || 0;
    const normalizedTargetBand = Number(targetBand) || 6.5;
    const normalizedLevel = currentLevel || 'A2';

    const user = new User({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      goal: numericGoal,
      targetBand: normalizedTargetBand,
      currentLevel: normalizedLevel,
    });
    await user.save();

    // Send verification email (non-blocking for registration if email is not configured)
    let verificationEmailSent = false;
    if (isEmailConfigured() && getAppBaseUrl()) {
      try {
        await issueEmailVerification(user);
        verificationEmailSent = true;
      } catch (e) {
        console.error('Email verification send error:', e?.message || e);
      }
    }

    const token = generateToken(user);
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        targetBand: user.targetBand,
        currentLevel: user.currentLevel,
        emailVerified: !!user.emailVerified,
      },
      token,
      verification: {
        required: true,
        emailSent: verificationEmailSent,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        targetBand: user.targetBand,
        currentLevel: user.currentLevel,
        emailVerified: !!user.emailVerified,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.userId || decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = String(email).toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetUrl = buildResetPasswordUrl(rawToken, user.email);

    await sendPasswordReset(user.email, resetUrl);

    return res.json({ success: true, message: 'Password reset instructions have been sent if the account exists.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ message: 'Unable to process password reset request right now.' });
  }
};

exports.confirmPasswordReset = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token, and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex');
    const user = await User.findOne({
      email: String(email).toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    return res.status(500).json({ message: 'Unable to reset password right now.' });
  }
};

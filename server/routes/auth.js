const express = require('express');
const User = require('../models/User');
const { register, login, getUserProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getUserProfile);

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, goal, targetBand, currentLevel } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, goal, targetBand, currentLevel },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        targetBand: user.targetBand,
        currentLevel: user.currentLevel,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Token is valid',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      goal: req.user.goal,
      targetBand: req.user.targetBand,
      currentLevel: req.user.currentLevel,
      plan: req.user.plan
    }
  });
});

// Forgot password - send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ 
        message: 'If that email exists, we\'ve sent a reset link'
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    
    // Save reset token to user (expires in 1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email (using centralized email service instance)
    const emailService = require('../services/emailService');
    const resetLink = `${process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const subject = 'Reset your IELTS Platform password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 22px;">Password Reset</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to continue:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </div>
          <p>Or use this code:</p>
          <div style="background: white; border-left: 4px solid #667eea; padding: 12px 16px; border-radius: 6px; font-weight: bold;">${resetToken}</div>
          <p style="color:#666; font-size: 12px;">This link expires in 1 hour. If you did not request a password reset, you can ignore this email.</p>
        </div>
      </div>`;
    try {
      await emailService.sendEmail(user.email, subject, html);
    } catch (e) {
      console.warn('sendEmail failed (non-fatal):', e?.message);
    }

    // Always return generic success to avoid user enumeration and email transport dependency
    res.json({ 
      success: true,
      message: 'If that email exists, we\'ve sent a reset link'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify reset token
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    res.json({ 
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ 
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
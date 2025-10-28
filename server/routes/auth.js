const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { mockUsers, createMockUser } = require('../middleware/mockData');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this-in-production';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, goal, targetBand, currentLevel } = req.body;

    // Enhanced validation
    const errors = {};
    
    if (!name || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please provide a valid email address';
      }
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists with this email',
        errors: { email: 'Email already exists' }
      });
    }

    // Create user
    const user = await User.create({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: password,
      goal: goal || 'Thử sức',
      targetBand: targetBand || 6.5,
      currentLevel: currentLevel || 'A2'
    });

    // Generate token
    const token = generateToken(user._id);

    // Send welcome email (async, don't wait for it)
    const { sendEmail } = require('../services/emailService');
    sendEmail(user.email, 'welcome', user.name)
      .then(result => {
        console.log('✅ Welcome email sent successfully:', result);
      })
      .catch(err => {
        console.error('❌ Welcome email error:', err);
      });

    res.status(201).json({
      message: 'User registered successfully',
      token,
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
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password',
        showForgotPassword: false
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(401).json({ 
        message: 'Account temporarily locked. Please try again later.',
        showForgotPassword: true
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 3 failed attempts
      if (user.loginAttempts >= 3) {
        user.lockUntil = Date.now() + 3600000; // Lock for 1 hour
        await user.save();
        return res.status(401).json({ 
          message: 'Account locked due to multiple failed attempts. Use forgot password.',
          showForgotPassword: true,
          attemptsRemaining: 0
        });
      }
      
      await user.save();
      
      return res.status(401).json({ 
        message: 'Invalid email or password',
        showForgotPassword: user.loginAttempts >= 2,
        attemptsRemaining: 3 - user.loginAttempts
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        goal: req.user.goal,
        targetBand: req.user.targetBand,
        currentLevel: req.user.currentLevel,
        plan: req.user.plan,
        freeTestsUsed: req.user.freeTestsUsed,
        paid: req.user.paid
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

    // Send reset email
    const { sendEmail } = require('../services/emailService');
    await sendEmail(
      user.email, 
      'passwordReset', 
      { 
        userName: user.name,
        resetCode: resetToken,
        resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      }
    );

    res.json({ 
      success: true,
      message: 'Password reset code sent to your email'
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
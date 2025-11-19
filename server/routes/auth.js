const express = require('express');
const User = require('../models/User');
const { register, login, getUserProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getUserProfile);

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

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      currentLevel: req.user.currentLevel,
      targetBand: req.user.targetBand,
    },
  });
});

module.exports = router;
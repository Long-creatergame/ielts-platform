const express = require('express');
const router = express.Router();

// GET /api/users/profile
router.get('/profile', async (req, res) => {
  try {
    const user = req.user || { 
      id: '000000000000000000000000',
      name: "Guest", 
      email: 'guest@example.com',
      plan: "basic", 
      isTrialUsed: false 
    };
    res.json(user);
  } catch (err) {
    console.error('User profile error:', err);
    res.status(500).json({ message: "Server error retrieving user profile" });
  }
});

module.exports = router;

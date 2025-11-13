const express = require('express');
const Leaderboard = require('../models/Leaderboard');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get top users
router.get('/top', async (req, res) => {
  try {
    const top = await Leaderboard.find().sort({ points: -1 }).limit(50);
    res.json({ success: true, data: top });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get current user rank
router.get('/me', auth, async (req, res) => {
  try {
    const me = await Leaderboard.findOne({ userId: req.user._id });
    const better = await Leaderboard.countDocuments({ points: { $gt: me?.points || 0 } });
    res.json({ success: true, data: { rank: better + 1, me } });
  } catch (error) {
    console.error('Leaderboard me error:', error);
    res.status(500).json({ error: 'Failed to fetch rank' });
  }
});

// Update points (on achievements or test complete)
router.post('/add-points', auth, async (req, res) => {
  try {
    const { points = 0, badge } = req.body;
    const doc = await Leaderboard.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: { userName: req.user.name, lastUpdated: new Date() },
        $inc: { points },
        ...(badge ? { $addToSet: { badges: badge } } : {})
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

module.exports = router;



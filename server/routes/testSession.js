const express = require('express');
const auth = require('../middleware/authMiddleware');
const TestSession = require('../models/TestSession');

const router = express.Router();

// PATCH /api/test/resume - restore or upsert session progress
router.patch('/resume', auth, async (req, res) => {
  try {
    const { skill, setId, progress = 0, responses = [], completed = false, audioTime, lastSkill } = req.body || {};
    if (!skill || !setId) {
      return res.status(400).json({ success: false, message: 'Missing skill or setId' });
    }

    const userId = req.user?._id || req.user?.userId;
    const filter = { userId, skill, setId, completed: false };
    const update = {
      $set: {
        progress: Math.max(0, Math.min(100, progress)),
        responses,
        completed,
        endTime: completed ? new Date() : undefined,
        ...(typeof audioTime === 'number' ? { audioTime } : {}),
        ...(lastSkill ? { lastSkill } : {})
      },
      $setOnInsert: {
        startTime: new Date()
      }
    };

    const session = await TestSession.findOneAndUpdate(filter, update, { new: true, upsert: true });
    return res.json({ success: true, data: session, message: 'Session saved' });
  } catch (err) {
    console.error('[TestSession:resume] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;



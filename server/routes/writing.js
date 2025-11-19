const express = require('express');
const auth = require('../middleware/authMiddleware');
const WritingSubmission = require('../models/WritingSubmission');
const aiScoringService = require('../services/aiScoringService');

const router = express.Router();

// Create a new writing submission and score it with AI
router.post('/submit', auth, async (req, res) => {
  try {
    const { prompt, essay, level = req.user.currentLevel || 'B1' } = req.body || {};

    if (!prompt || !essay) {
      return res.status(400).json({ success: false, message: 'Prompt and essay are required' });
    }

    const scoreResult = await aiScoringService.scoreWriting(essay, 'Task 2', { level });

    const submission = await WritingSubmission.create({
      userId: req.user._id,
      prompt: String(prompt).trim(),
      essay: String(essay).trim(),
      level,
      aiScore: scoreResult.data,
      scoringMeta: { source: scoreResult.source || 'ai' },
    });

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    console.error('[Writing] Submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to score writing submission' });
  }
});

// List submissions for the current user
router.get('/submissions', auth, async (req, res) => {
  try {
    const submissions = await WritingSubmission.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: submissions });
  } catch (error) {
    console.error('[Writing] Fetch submissions error:', error);
    res.status(500).json({ success: false, message: 'Failed to load submissions' });
  }
});

// Get a specific submission
router.get('/submissions/:id', auth, async (req, res) => {
  try {
    const submission = await WritingSubmission.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    console.error('[Writing] Fetch submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to load submission' });
  }
});

module.exports = router;


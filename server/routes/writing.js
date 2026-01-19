const express = require('express');
const auth = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const WritingSubmission = require('../models/WritingSubmission');
const aiScoringService = require('../services/aiScoringService');

const router = express.Router();

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

const writingSubmitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user?._id ? String(req.user._id) : req.ip),
  message: { success: false, message: 'Too many submissions, please try again later.' },
});

const writingSubmitSchema = z
  .object({
    prompt: z.string().trim().min(1, 'Prompt is required').max(2000, 'Prompt is too long'),
    essay: z.string().trim().min(50, 'Essay must be at least 50 characters').max(5000, 'Essay is too long'),
    level: z.enum(LEVEL_ENUM).optional(),
  })
  .passthrough();

// Create a new writing submission and score it with AI
router.post('/submit', auth, writingSubmitLimiter, validateBody(writingSubmitSchema), async (req, res) => {
  try {
    const { prompt, essay } = req.body || {};
    const level = req.body?.level || req.user.currentLevel || 'B1';

    const scoreResult = await aiScoringService.scoreWriting(essay, 'Task 2', { level });

    const submission = await WritingSubmission.create({
      userId: req.user._id,
      prompt: String(prompt).trim(),
      essay: String(essay).trim(),
      level,
      aiScore: scoreResult.data,
      scoringMeta: scoreResult.scoringMeta || { source: scoreResult.source || 'ai' },
    });

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    console.error('[Writing] Submit error:', error);
    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        message: error.publicMessage || error.message || 'AI scoring temporarily unavailable',
      });
    }
    if (error.status === 504) {
      return res.status(504).json({ success: false, message: 'AI scoring timed out, please try again.' });
    }
    if (error.status === 502) {
      return res.status(502).json({
        success: false,
        message: error.publicMessage || 'AI scoring failed, please try again.',
      });
    }
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


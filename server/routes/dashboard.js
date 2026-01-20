const express = require('express');
const User = require('../models/User');
const WritingSubmission = require('../models/WritingSubmission');
const auth = require('../middleware/authMiddleware');
const { z } = require('zod');

const router = express.Router();

const buildDefaultDashboard = (user) => ({
  user: {
    id: user?._id || null,
    name: user?.name || 'User',
    email: user?.email || '',
    currentLevel: user?.currentLevel || 'B1',
    targetBand: user?.targetBand || 6.5,
  },
  writing: {
    totalSubmissions: 0,
    averageBand: 0,
    latestSubmission: null,
  },
});

function normalizeOnboarding(onboarding) {
  const ob = onboarding || {};
  return {
    dashboardDone: !!ob.dashboardDone,
    testDone: !!ob.testDone,
    resultDone: !!ob.resultDone,
    completedAt: ob.completedAt || null,
  };
}

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('onboarding emailVerified');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: {
        onboarding: normalizeOnboarding(user.onboarding),
        emailVerified: !!user.emailVerified,
      },
    });
  } catch (error) {
    console.error('[Dashboard] /me error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
});

const onboardingPatchSchema = z
  .object({
    dashboardDone: z.boolean().optional(),
    testDone: z.boolean().optional(),
    resultDone: z.boolean().optional(),
  })
  .strict();

router.patch('/onboarding', auth, async (req, res, next) => {
  try {
    const parsed = onboardingPatchSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.statusCode = 400;
      err.details = parsed.error.issues.map((issue) => ({
        path: issue.path?.join('.') || 'body',
        message: issue.message,
      }));
      return next(err);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.onboarding = user.onboarding || {};
    Object.assign(user.onboarding, parsed.data);

    const allDone =
      user.onboarding.dashboardDone && user.onboarding.testDone && user.onboarding.resultDone;
    if (allDone && !user.onboarding.completedAt) {
      user.onboarding.completedAt = new Date();
    }
    if (!allDone) {
      user.onboarding.completedAt = undefined;
    }

    await user.save();

    return res.json({
      success: true,
      data: {
        onboarding: normalizeOnboarding(user.onboarding),
      },
    });
  } catch (error) {
    console.error('[Dashboard] /onboarding error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update onboarding' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email currentLevel targetBand');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const submissions = await WritingSubmission.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (!submissions.length) {
      return res.json({ success: true, data: buildDefaultDashboard(user) });
    }

    const totalSubmissions = await WritingSubmission.countDocuments({ userId: user._id });
    const bandScores = submissions
      .map((s) => s.aiScore?.overall)
      .filter((value) => typeof value === 'number');
    const averageBand =
      bandScores.length > 0
        ? Number((bandScores.reduce((sum, band) => sum + band, 0) / bandScores.length).toFixed(1))
        : 0;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          currentLevel: user.currentLevel,
          targetBand: user.targetBand,
        },
        writing: {
          totalSubmissions,
          averageBand,
          latestSubmission: submissions[0],
          recentSubmissions: submissions,
        },
      },
    });
  } catch (error) {
    console.error('[Dashboard] error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard' });
  }
});

module.exports = router;
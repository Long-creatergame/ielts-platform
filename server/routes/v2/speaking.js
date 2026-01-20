const express = require('express');
const auth = require('../../middleware/authMiddleware');
const { z } = require('zod');

const {
  startSpeakingAttempt,
  submitSpeakingAttempt,
  getSpeakingAttempt,
} = require('../../v2/controllers/speakingAttemptsController');

const router = express.Router();

const startSchema = z
  .object({
    sessionId: z.string().min(1),
  })
  .strict();

// MVP: accept transcript; later: audio upload + ASR job.
const submitSchema = z
  .object({
    transcript: z.string().trim().min(20).max(20000),
    clientMeta: z
      .object({
        userAgent: z.string().optional(),
        durationSeconds: z.number().int().nonnegative().optional(),
      })
      .optional(),
  })
  .strict();

router.post('/attempts', auth, (req, res, next) => {
  const parsed = startSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.statusCode = 400;
    err.details = parsed.error.issues.map((i) => ({ path: i.path?.join('.') || 'body', message: i.message }));
    return next(err);
  }
  req.body = parsed.data;
  return startSpeakingAttempt(req, res, next);
});

router.get('/attempts/:id', auth, getSpeakingAttempt);

router.post('/attempts/:id/submit', auth, (req, res, next) => {
  const parsed = submitSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.statusCode = 400;
    err.details = parsed.error.issues.map((i) => ({ path: i.path?.join('.') || 'body', message: i.message }));
    return next(err);
  }
  req.body = parsed.data;
  return submitSpeakingAttempt(req, res, next);
});

module.exports = router;


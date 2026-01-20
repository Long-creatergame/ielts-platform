const express = require('express');
const auth = require('../../middleware/authMiddleware');
const { z } = require('zod');

const {
  startWritingAttempt,
  submitWritingAttempt,
  getWritingAttempt,
} = require('../../v2/controllers/writingAttemptsController');

const router = express.Router();

const startSchema = z
  .object({
    sessionId: z.string().min(1),
  })
  .strict();

const submitSchema = z
  .object({
    essay: z.string().trim().min(50).max(5000),
    timezone: z.string().optional(),
    clientMeta: z
      .object({
        userAgent: z.string().optional(),
        wordCount: z.number().int().nonnegative().optional(),
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
  return startWritingAttempt(req, res, next);
});

router.get('/attempts/:id', auth, getWritingAttempt);

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
  return submitWritingAttempt(req, res, next);
});

module.exports = router;


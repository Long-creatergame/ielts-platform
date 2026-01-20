const express = require('express');
const auth = require('../../middleware/authMiddleware');
const { z } = require('zod');
const fs = require('fs');
const path = require('path');

const {
  startSpeakingAttempt,
  submitSpeakingAttempt,
  submitSpeakingAttemptAudio,
  getSpeakingAttempt,
} = require('../../v2/controllers/speakingAttemptsController');

const router = express.Router();

let multer = null;
try {
  // eslint-disable-next-line global-require
  multer = require('multer');
} catch (_) {
  multer = null;
}

const uploadDir = path.join(__dirname, '../../uploads/speaking');
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (_) {}

const upload =
  multer &&
  multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) => {
        const safe = String(file.originalname || 'audio.webm')
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .slice(-80);
        cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}-${safe}`);
      },
    }),
    limits: {
      fileSize: 25 * 1024 * 1024, // 25MB
    },
  });

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

// Mock-test friendly: upload audio once, server transcribes + scores.
router.post('/attempts/:id/submit-audio', auth, (req, res, next) => {
  if (!upload) {
    return res.status(501).json({
      success: false,
      message: 'Audio upload not available (multer not installed).',
    });
  }
  return upload.single('audio')(req, res, (err) => {
    if (err) return next(err);
    return submitSpeakingAttemptAudio(req, res, next);
  });
});

module.exports = router;


const express = require('express');
const auth = require('../../middleware/authMiddleware');
const { z } = require('zod');

const { createSession, getSession } = require('../../v2/controllers/sessionsController');

const router = express.Router();

const createSchema = z
  .object({
    mode: z.enum(['practice', 'mock']).default('practice'),
    module: z.enum(['writing', 'speaking']),
    timeLimitSeconds: z.number().int().positive().optional(),
    promptId: z.string().optional(), // optional reference into PromptBank
    promptText: z.string().optional(), // allow ad-hoc prompts for MVP
  })
  .strict();

router.post('/', auth, (req, res, next) => {
  const parsed = createSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.statusCode = 400;
    err.details = parsed.error.issues.map((i) => ({ path: i.path?.join('.') || 'body', message: i.message }));
    return next(err);
  }
  req.body = parsed.data;
  return createSession(req, res, next);
});

router.get('/:id', auth, getSession);

module.exports = router;


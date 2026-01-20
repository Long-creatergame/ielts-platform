const crypto = require('crypto');
const fs = require('fs');

const V2TestSession = require('../models/TestSession');
const V2SpeakingAttempt = require('../models/SpeakingAttempt');
const V2ScoreReport = require('../models/ScoreReport');
const V2StudentProfile = require('../models/StudentProfile');

const { scoreSpeaking } = require('../scoring/speakingPipeline');
const OpenAI = require('openai');

function hashTranscript(text) {
  return crypto.createHash('sha256').update(String(text || '')).digest('hex');
}

function createOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
  });
}

async function transcribeAudioFile(filePath) {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error('AI scoring not configured');
    err.statusCode = 503;
    err.publicMessage = 'AI (ASR) is not configured on the server.';
    throw err;
  }
  const openai = createOpenAI();
  const model = process.env.OPENAI_ASR_MODEL || 'whisper-1';
  const resp = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model,
  });
  return (resp && resp.text) || '';
}

async function ensureProfile(userId) {
  const existing = await V2StudentProfile.findOne({ userId });
  if (existing) return existing;
  return V2StudentProfile.create({ userId });
}

function mergeWeaknesses(existing, incoming) {
  const next = [...existing];
  for (const w of incoming) {
    const idx = next.findIndex((x) => x.area === w.area && x.pattern === w.pattern);
    if (idx >= 0) {
      next[idx].count = (next[idx].count || 1) + 1;
      next[idx].lastSeenAt = new Date();
      next[idx].impact = w.impact;
    } else {
      next.push({ ...w, count: 1, lastSeenAt: new Date() });
    }
  }
  next.sort((a, b) => (b.count || 0) - (a.count || 0));
  return next.slice(0, 12);
}

exports.startSpeakingAttempt = async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.body;

  const session = await V2TestSession.findById(sessionId).lean();
  if (!session || String(session.userId) !== String(userId) || session.module !== 'speaking') {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const attempt = await V2SpeakingAttempt.create({
    userId,
    sessionId: session._id,
    cueCardText: session.promptText,
    timeLimitSeconds: session.timeLimitSeconds,
  });

  return res.json({
    success: true,
    data: {
      attemptId: attempt._id,
      cueCardText: attempt.cueCardText,
      timeLimitSeconds: attempt.timeLimitSeconds,
      startedAt: attempt.startedAt,
    },
  });
};

exports.getSpeakingAttempt = async (req, res) => {
  const userId = String(req.user._id);
  const attempt = await V2SpeakingAttempt.findById(req.params.id).lean();
  if (!attempt || String(attempt.userId) !== userId) {
    return res.status(404).json({ success: false, message: 'Attempt not found' });
  }
  return res.json({ success: true, data: attempt });
};

exports.submitSpeakingAttempt = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const attempt = await V2SpeakingAttempt.findById(req.params.id);
    if (!attempt || String(attempt.userId) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    if (attempt.status === 'submitted') {
      if (attempt.scoreReportId) {
        const report = await V2ScoreReport.findById(attempt.scoreReportId).lean();
        return res.json({ success: true, data: report?.report, cached: true });
      }
      return res.status(409).json({ success: false, message: 'Attempt already submitted' });
    }

    const { transcript, clientMeta } = req.body;
    attempt.transcript = transcript;
    attempt.submittedAt = new Date();
    attempt.status = 'submitted';
    attempt.clientMeta = clientMeta || {};
    await attempt.save();

    const inputHash = hashTranscript(`${attempt.cueCardText}|||${transcript}`);
    const existing = await V2ScoreReport.findOne({ module: 'speaking', inputHash }).lean();
    if (existing) {
      attempt.scoreReportId = existing._id;
      await attempt.save();
      return res.json({ success: true, data: existing.report, cached: true });
    }

    const last = await V2ScoreReport.findOne({ userId, module: 'speaking' }).sort({ createdAt: -1 }).lean();
    const lastReport = last?.report || null;

    const scored = await scoreSpeaking({
      cueCardText: attempt.cueCardText,
      transcript,
      lastReport,
    });

    const scoreDoc = await V2ScoreReport.create({
      userId,
      module: 'speaking',
      attemptId: attempt._id,
      inputHash: scored.inputHash,
      promptVersion: scored.promptVersion,
      model: scored.model,
      temperature: scored.temperature,
      report: scored.report,
    });

    attempt.scoreReportId = scoreDoc._id;
    await attempt.save();

    const profile = await ensureProfile(userId);
    profile.abilityHistory.push({
      at: new Date(),
      module: 'speaking',
      overallBand: scored.report.overall_band,
      criteria: scored.report.criteria,
    });
    profile.recurringWeaknesses = mergeWeaknesses(profile.recurringWeaknesses || [], scored.report.top_3_weaknesses);
    profile.plan7Days = scored.report.next_steps_7_days;
    profile.lastUpdatedAt = new Date();
    await profile.save();

    return res.json({ success: true, data: scored.report, cached: false });
  } catch (err) {
    return next(err);
  }
};

// Audio upload path: (1) store audio, (2) ASR transcript, (3) score.
exports.submitSpeakingAttemptAudio = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const attempt = await V2SpeakingAttempt.findById(req.params.id);
    if (!attempt || String(attempt.userId) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    if (attempt.status === 'submitted') {
      if (attempt.scoreReportId) {
        const report = await V2ScoreReport.findById(attempt.scoreReportId).lean();
        return res.json({ success: true, data: report?.report, cached: true });
      }
      return res.status(409).json({ success: false, message: 'Attempt already submitted' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: 'Missing audio file' });
    }

    // Save audio metadata (local storage)
    attempt.audio = {
      storage: 'local',
      url: undefined,
      mimeType: req.file.mimetype,
      durationSeconds: undefined,
    };

    const transcript = (await transcribeAudioFile(req.file.path)).trim();
    if (!transcript || transcript.length < 20) {
      const err = new Error('ASR transcript too short');
      err.statusCode = 502;
      err.publicMessage = 'Could not transcribe audio reliably. Please try again.';
      throw err;
    }

    attempt.transcript = transcript;
    attempt.submittedAt = new Date();
    attempt.status = 'submitted';
    await attempt.save();

    const inputHash = hashTranscript(`${attempt.cueCardText}|||${transcript}`);
    const existing = await V2ScoreReport.findOne({ module: 'speaking', inputHash }).lean();
    if (existing) {
      attempt.scoreReportId = existing._id;
      await attempt.save();
      return res.json({ success: true, data: existing.report, cached: true });
    }

    const last = await V2ScoreReport.findOne({ userId, module: 'speaking' }).sort({ createdAt: -1 }).lean();
    const lastReport = last?.report || null;

    const scored = await scoreSpeaking({
      cueCardText: attempt.cueCardText,
      transcript,
      lastReport,
    });

    const scoreDoc = await V2ScoreReport.create({
      userId,
      module: 'speaking',
      attemptId: attempt._id,
      inputHash: scored.inputHash,
      promptVersion: scored.promptVersion,
      model: scored.model,
      temperature: scored.temperature,
      report: scored.report,
    });

    attempt.scoreReportId = scoreDoc._id;
    await attempt.save();

    const profile = await ensureProfile(userId);
    profile.abilityHistory.push({
      at: new Date(),
      module: 'speaking',
      overallBand: scored.report.overall_band,
      criteria: scored.report.criteria,
    });
    profile.recurringWeaknesses = mergeWeaknesses(profile.recurringWeaknesses || [], scored.report.top_3_weaknesses);
    profile.plan7Days = scored.report.next_steps_7_days;
    profile.lastUpdatedAt = new Date();
    await profile.save();

    return res.json({ success: true, data: scored.report, cached: false });
  } catch (err) {
    return next(err);
  }
};


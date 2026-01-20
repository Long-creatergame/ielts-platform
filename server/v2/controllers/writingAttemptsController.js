const crypto = require('crypto');

const V2TestSession = require('../models/TestSession');
const V2WritingAttempt = require('../models/WritingAttempt');
const V2ScoreReport = require('../models/ScoreReport');
const V2StudentProfile = require('../models/StudentProfile');

const { scoreWriting } = require('../scoring/writingPipeline');

function hashEssay(text) {
  return crypto.createHash('sha256').update(String(text || '')).digest('hex');
}

function calcTemplateRisk(essay) {
  const s = String(essay || '').toLowerCase();
  const markers = [
    'to conclude, i believe that',
    'this essay will discuss both views',
    'it is undeniable that',
    'nowadays, in modern society',
    'on the one hand',
    'on the other hand',
  ];
  const hits = markers.filter((m) => s.includes(m)).length;
  return Math.min(1, hits / 6);
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

exports.startWritingAttempt = async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.body;

  const session = await V2TestSession.findById(sessionId).lean();
  if (!session || String(session.userId) !== String(userId) || session.module !== 'writing') {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const attempt = await V2WritingAttempt.create({
    userId,
    sessionId: session._id,
    promptText: session.promptText,
    timeLimitSeconds: session.timeLimitSeconds,
  });

  return res.json({
    success: true,
    data: {
      attemptId: attempt._id,
      promptText: attempt.promptText,
      timeLimitSeconds: attempt.timeLimitSeconds,
      startedAt: attempt.startedAt,
    },
  });
};

exports.getWritingAttempt = async (req, res) => {
  const userId = String(req.user._id);
  const attempt = await V2WritingAttempt.findById(req.params.id).lean();
  if (!attempt || String(attempt.userId) !== userId) {
    return res.status(404).json({ success: false, message: 'Attempt not found' });
  }
  return res.json({ success: true, data: attempt });
};

exports.submitWritingAttempt = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const attempt = await V2WritingAttempt.findById(req.params.id);
    if (!attempt || String(attempt.userId) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    if (attempt.status === 'submitted') {
      // idempotent: return existing report if present
      if (attempt.scoreReportId) {
        const report = await V2ScoreReport.findById(attempt.scoreReportId).lean();
        return res.json({ success: true, data: report?.report, cached: true });
      }
      return res.status(409).json({ success: false, message: 'Attempt already submitted' });
    }

    const { essay, timezone, clientMeta } = req.body;
    attempt.essay = essay;
    attempt.submittedAt = new Date();
    attempt.status = 'submitted';
    attempt.clientMeta = { ...(clientMeta || {}), timezone };
    attempt.antiCheat = {
      templateRisk: calcTemplateRisk(essay),
      notes: [],
    };
    await attempt.save();

    // Repeatability: same prompt+essay => same report (cache hit)
    const inputHash = hashEssay(`${attempt.promptText}|||${essay}`);
    const existing = await V2ScoreReport.findOne({ module: 'writing', inputHash }).lean();
    if (existing) {
      attempt.scoreReportId = existing._id;
      await attempt.save();
      return res.json({ success: true, data: existing.report, cached: true });
    }

    // delta: fetch last report for writing
    const last = await V2ScoreReport.findOne({ userId, module: 'writing' }).sort({ createdAt: -1 }).lean();
    const lastReport = last?.report || null;

    const scored = await scoreWriting({
      promptText: attempt.promptText,
      essayText: essay,
      lastReport,
    });

    const scoreDoc = await V2ScoreReport.create({
      userId,
      module: 'writing',
      attemptId: attempt._id,
      inputHash: scored.inputHash,
      promptVersion: scored.promptVersion,
      model: scored.model,
      temperature: scored.temperature,
      report: scored.report,
    });

    attempt.scoreReportId = scoreDoc._id;
    await attempt.save();

    // Update StudentProfile
    const profile = await ensureProfile(userId);
    profile.abilityHistory.push({
      at: new Date(),
      module: 'writing',
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


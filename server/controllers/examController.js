const ExamSession = require('../models/ExamSession');
const ExamResult = require('../models/ExamResult');
const { generateExam, gradeExam } = require('../services/examEngine');
const { saveFeedback } = require('../services/aiFeedbackService');

async function start(req, res) {
  try {
    const userId = req.user?._id || req.user?.userId;
    const { mode = 'cambridge', skill = 'reading', setId } = req.body || {};

    const test = await generateExam(mode, skill, setId);
    const session = await ExamSession.create({ userId, mode, testId: test?._id || setId || 'practice', skill });
    return res.json({ success: true, data: { sessionId: session._id, test } });
  } catch (err) {
    console.error('[ExamController:start]', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function submit(req, res) {
  try {
    const userId = req.user?._id || req.user?.userId;
    const { sessionId, answers, answerKeysOrText } = req.body || {};
    const session = await ExamSession.findById(sessionId);
    if (!session || session.userId.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const graded = await gradeExam(session.skill, answers, answerKeysOrText);
    session.answers = answers;
    session.status = 'submitted';
    session.endTime = new Date();
    await session.save();

    // Save per-skill result
    const bandScores = { listening: 0, reading: 0, writing: 0, speaking: 0 };
    bandScores[session.skill] = graded.band;
    const overall = graded.band;
    await ExamResult.findOneAndUpdate(
      { sessionId: session._id },
      { $set: { userId, bandScores, overall } },
      { upsert: true }
    );

    await saveFeedback(session._id, userId, session.skill, graded.feedback, 'Focus on weak areas.');

    return res.json({ success: true, data: { sessionId: session._id, band: graded.band, feedback: graded.feedback } });
  } catch (err) {
    console.error('[ExamController:submit]', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function result(req, res) {
  try {
    const { id } = req.params;
    const doc = await ExamResult.findOne({ sessionId: id });
    if (!doc) return res.status(404).json({ success: false, message: 'Result not found' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('[ExamController:result]', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function listSessions(req, res) {
  try {
    const docs = await ExamSession.find({}).limit(200).lean();
    return res.json(docs);
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function patchSession(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    await ExamSession.updateOne({ _id: id }, { $set: updates });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { start, submit, result, listSessions, patchSession };



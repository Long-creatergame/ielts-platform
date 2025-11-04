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
    const { sessionId, answers, answerKeysOrText, skill } = req.body || {};
    
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required' });
    }

    const session = await ExamSession.findById(sessionId);
    if (!session || session.userId.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Null safety: ensure answers is an array or object
    const safeAnswers = answers || [];
    const actualSkill = skill || session.skill || 'reading';

    let graded;
    try {
      graded = await gradeExam(actualSkill, safeAnswers, answerKeysOrText);
    } catch (gradeError) {
      console.error('[ExamController:submit] Grade error:', gradeError.message);
      // Fallback: provide default feedback
      graded = {
        band: 0,
        feedback: { summary: 'Feedback not available due to system timeout. Please try again later.' }
      };
    }

    // Ensure feedback is always an object
    if (!graded.feedback || typeof graded.feedback !== 'object') {
      graded.feedback = { summary: graded.feedback || 'Feedback not available due to system timeout.' };
    }

    session.answers = safeAnswers;
    session.status = 'submitted';
    session.endTime = new Date();
    await session.save();

    // Save per-skill result
    const bandScores = { listening: 0, reading: 0, writing: 0, speaking: 0 };
    bandScores[actualSkill] = graded.band || 0;
    const overall = graded.band || 0;
    await ExamResult.findOneAndUpdate(
      { sessionId: session._id },
      { $set: { userId, bandScores, overall } },
      { upsert: true }
    );

    try {
      await saveFeedback(session._id, userId, actualSkill, graded.feedback, 'Focus on weak areas.');
    } catch (feedbackError) {
      console.error('[ExamController:submit] Feedback save error:', feedbackError.message);
      // Continue without failing the request
    }

    return res.json({ 
      success: true, 
      data: { 
        sessionId: session._id, 
        band: graded.band || 0, 
        feedback: graded.feedback 
      } 
    });
  } catch (err) {
    console.error('[ExamController:submit]', err.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
}

async function result(req, res) {
  try {
    const { id } = req.params;
    const doc = await ExamResult.findOne({ sessionId: id }).populate('sessionId');
    
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    // Fetch AI feedback if available
    const AI_Feedback = require('../models/AI_Feedback');
    const feedback = await AI_Feedback.findOne({ sessionId: id }).lean();
    
    const resultData = {
      ...doc.toObject(),
      feedback: feedback || null
    };

    return res.json({ success: true, data: resultData });
  } catch (err) {
    console.error('[ExamController:result]', err.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
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



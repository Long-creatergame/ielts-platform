const TestSession = require('../models/TestSession');
const CambridgeTest = require('../models/CambridgeTest');
const AIResult = require('../models/AIResult');
const Feedback = require('../models/Feedback');
const { assessWriting } = require('../services/ai/writingAssessment');
const { assessSpeaking } = require('../services/ai/speakingAssessor');
const { evaluateReading } = require('../services/ai/readingEvaluator');
const { evaluateListening } = require('../services/ai/listeningEvaluator');
const fs = require('fs');
const path = require('path');

async function startTest(req, res) {
  try {
    const { skill, setId } = req.body;
    const userId = req.user?._id || req.user?.userId;

    if (!skill || !setId) {
      return res.status(400).json({ success: false, message: 'Missing skill or setId' });
    }

    // Load Cambridge test data
    const fileMap = {
      reading: 'readingCambridge.json',
      listening: 'listeningCambridge.json',
      writing: 'writingCambridge.json',
      speaking: 'speakingCambridge.json'
    };
    const filename = fileMap[skill.toLowerCase()];
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Invalid skill' });
    }

    const dataPath = path.join(__dirname, `../data/cambridge/${filename}`);
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const testData = data.setId === setId ? data : null;
    if (!testData) {
      return res.status(404).json({ success: false, message: 'Test set not found' });
    }

    // Create or find CambridgeTest document
    let cambridgeTest = await CambridgeTest.findOne({ skill, section: testData.section || 1, setId });
    if (!cambridgeTest) {
      cambridgeTest = new CambridgeTest({
        skill,
        section: testData.section || 1,
        setId,
        passages: testData.passages || testData.sections || [],
        audio_url: testData.sections?.[0]?.audioUrl || testData.audioUrl,
        audio_urls: Array.isArray(testData.sections) ? testData.sections.map(s => s.audioUrl).filter(Boolean) : [],
        question_count: testData.totalQuestions || 40,
        answer_keys: testData.answerKeys || [],
        mode: testData.mode || 'academic',
        blueprint: testData.blueprint || {},
        image_urls: testData.task1?.image ? [testData.task1.image] : []
      });
      await cambridgeTest.save();
    }

    // Create TestSession
    const session = new TestSession({
      userId,
      cambridgeTestId: cambridgeTest._id,
      skill,
      setId,
      startTime: new Date(),
      progress: 0,
      completed: false
    });
    await session.save();

    return res.json({
      success: true,
      data: {
        sessionId: session._id,
        testData: testData,
        startTime: session.startTime
      }
    });
  } catch (err) {
    console.error('[CambridgeController:startTest] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function submitTest(req, res) {
  try {
    const { sessionId, responses } = req.body;
    const userId = req.user?._id || req.user?.userId;

    if (!sessionId || !responses) {
      return res.status(400).json({ success: false, message: 'Missing sessionId or responses' });
    }

    const session = await TestSession.findById(sessionId).populate('cambridgeTestId');
    if (!session || session.userId.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const cambridgeTest = session.cambridgeTestId;
    if (!cambridgeTest) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Update session
    session.responses = responses;
    session.completed = true;
    session.endTime = new Date();
    session.progress = 100;
    await session.save();

    // Evaluate based on skill
    let aiResult;
    if (session.skill === 'reading') {
      const evalResult = evaluateReading(responses, cambridgeTest.answer_keys);
      aiResult = new AIResult({
        testSessionId: session._id,
        userId,
        skill: 'reading',
        band_overall: evalResult.band,
        comments: `Reading: ${evalResult.correct}/${evalResult.total} correct (${evalResult.percentage.toFixed(1)}%)`
      });
    } else if (session.skill === 'listening') {
      const evalResult = evaluateListening(responses, cambridgeTest.answer_keys);
      aiResult = new AIResult({
        testSessionId: session._id,
        userId,
        skill: 'listening',
        band_overall: evalResult.band,
        comments: `Listening: ${evalResult.correct}/${evalResult.total} correct (${evalResult.percentage.toFixed(1)}%)`
      });
    } else if (session.skill === 'writing') {
      const text = Array.isArray(responses) ? responses.join('\n') : responses;
      const assessment = await assessWriting(text);
      aiResult = new AIResult({
        testSessionId: session._id,
        userId,
        skill: 'writing',
        band_overall: assessment.band_overall,
        task_achievement: assessment.task_achievement,
        coherence: assessment.coherence,
        lexical: assessment.lexical,
        grammar: assessment.grammar,
        comments: assessment.comments
      });
    } else if (session.skill === 'speaking') {
      const transcript = Array.isArray(responses) ? responses.join(' ') : responses;
      const assessment = await assessSpeaking(transcript);
      aiResult = new AIResult({
        testSessionId: session._id,
        userId,
        skill: 'speaking',
        band_overall: assessment.band_overall,
        task_achievement: assessment.fluency,
        coherence: assessment.pronunciation,
        lexical: assessment.lexical,
        grammar: assessment.grammar,
        comments: assessment.comments
      });
    }

    if (aiResult) {
      await aiResult.save();

      // Create Feedback
      const feedback = new Feedback({
        aiResultId: aiResult._id,
        userId,
        skill: session.skill,
        summary: aiResult.comments || 'Assessment completed',
        suggestion: `Focus on improving ${session.skill} skills`,
        improvement_plan: `Continue practicing ${session.skill} with Cambridge materials`
      });
      await feedback.save();
    }

    return res.json({
      success: true,
      data: {
        sessionId: session._id,
        band: aiResult?.band_overall || 0,
        feedback: aiResult?.comments || 'Assessment completed'
      }
    });
  } catch (err) {
    console.error('[CambridgeController:submitTest] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getHistory(req, res) {
  try {
    const { userId: paramUserId } = req.params;
    const userId = req.user?._id || req.user?.userId || paramUserId;

    const sessions = await TestSession.find({ userId, completed: true })
      .populate('cambridgeTestId')
      .sort({ endTime: -1 })
      .limit(20);

    const results = await Promise.all(
      sessions.map(async (session) => {
        const aiResult = await AIResult.findOne({ testSessionId: session._id });
        const feedback = aiResult ? await Feedback.findOne({ aiResultId: aiResult._id }) : null;
        return {
          sessionId: session._id,
          skill: session.skill,
          setId: session.setId,
          band: aiResult?.band_overall || 0,
          completedAt: session.endTime,
          feedback: feedback?.summary || aiResult?.comments || null
        };
      })
    );

    return res.json({ success: true, data: results });
  } catch (err) {
    console.error('[CambridgeController:getHistory] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getTestBySkill(req, res) {
  try {
    const { skill } = req.params;
    const { setId } = req.query || {};
    const fileMap = {
      reading: 'readingCambridge.json',
      listening: 'listeningCambridge.json',
      writing: 'writingCambridge.json',
      speaking: 'speakingCambridge.json'
    };
    const filename = fileMap[skill.toLowerCase()];
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Invalid skill' });
    }

    const dataPath = path.join(__dirname, `../data/cambridge/${filename}`);
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Build absolute media URLs
    const frontend = process.env.FRONTEND_URL || '';

    // Prefer DB media mapping when setId is provided
    if (setId) {
      const testDoc = await CambridgeTest.findOne({ skill: skill.toLowerCase(), setId });
      if (testDoc) {
        data.setId = setId;
        if (Array.isArray(testDoc.audio_urls)) {
          data.audio_urls = testDoc.audio_urls.map(u => `${frontend}${u}`);
        }
        if (Array.isArray(testDoc.image_urls)) {
          data.image_urls = testDoc.image_urls.map(u => `${frontend}${u}`);
        }
      }
    }

    if (skill === 'listening' && data.sections && !data.audio_urls) {
      data.sections = data.sections.map((sec) => ({
        ...sec,
        audioUrl: sec.audioUrl ? `${frontend}${sec.audioUrl}` : `${frontend}/audio/cambridge/default_listening.mp3`
      }));
      data.audio_urls = data.sections.map(s => s.audioUrl);
    }
    if (skill === 'writing' && !data.image_urls) {
      const img = data.task1?.image || '/images/writing/task1_bar_chart.png';
      data.image_urls = [ `${frontend}${img}` ];
      if (data.task1 && !data.task1.image) data.task1.image = `${frontend}${img}`;
    }

    return res.json({ success: true, data });
  } catch (err) {
    console.error('[CambridgeController:getTestBySkill] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { startTest, submitTest, getHistory, getTestBySkill };


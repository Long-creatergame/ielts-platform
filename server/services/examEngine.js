const CambridgeTest = require('../models/CambridgeTest');
const { evaluateReading } = require('./ai/readingEvaluator');
const { evaluateListening } = require('./ai/listeningEvaluator');
const { assessWriting } = require('./ai/writingAssessment');
const { assessSpeaking } = require('./ai/speakingAssessor');

async function generateExam(mode, skill, setId) {
  if (mode === 'cambridge') {
    // Prefer a specific set if provided
    const query = { skill };
    if (setId) query.setId = setId;
    const ct = await CambridgeTest.findOne(query).lean();
    return ct || null;
  }
  // practice: return minimal placeholder
  return { skill, blueprint: {}, question_count: 40 };
}

async function gradeExam(skill, responses, answerKeysOrText) {
  if (skill === 'reading') {
    const res = evaluateReading(responses, answerKeysOrText);
    return { band: res.band, feedback: `Reading ${res.correct}/${res.total}` };
  }
  if (skill === 'listening') {
    const res = evaluateListening(responses, answerKeysOrText);
    return { band: res.band, feedback: `Listening ${res.correct}/${res.total}` };
  }
  if (skill === 'writing') {
    const text = Array.isArray(responses) ? responses.join('\n') : responses;
    const res = await assessWriting(text);
    return { band: res.band_overall, feedback: res.comments };
  }
  if (skill === 'speaking') {
    const transcript = Array.isArray(responses) ? responses.join(' ') : responses;
    const res = await assessSpeaking(transcript);
    return { band: res.band_overall, feedback: res.comments };
  }
  return { band: 0, feedback: 'Unknown skill' };
}

module.exports = { generateExam, gradeExam };



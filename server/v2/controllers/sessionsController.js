const V2TestSession = require('../models/TestSession');
const V2PromptBank = require('../models/PromptBank');

function defaultTimeLimitSeconds(module, mode) {
  // MVP defaults (can be configured per prompt/session)
  if (module === 'writing') return mode === 'mock' ? 40 * 60 : 40 * 60; // Task 2 focus
  if (module === 'speaking') return 2 * 60 + 60; // prep + speak
  return 30 * 60;
}

exports.createSession = async (req, res) => {
  const userId = req.user._id;
  const { mode, module, timeLimitSeconds, promptId, promptText } = req.body;

  let resolvedPromptText = promptText;

  if (!resolvedPromptText && promptId) {
    const prompt = await V2PromptBank.findById(promptId).lean();
    if (prompt?.promptText) resolvedPromptText = prompt.promptText;
  }

  // Hard requirement for MVP: prompt text must exist.
  if (!resolvedPromptText) {
    return res.status(400).json({
      success: false,
      message: 'Missing promptText (or promptId could not be resolved).',
    });
  }

  const session = await V2TestSession.create({
    userId,
    mode,
    module,
    timeLimitSeconds: timeLimitSeconds ?? defaultTimeLimitSeconds(module, mode),
    promptId: promptId || undefined,
    promptText: resolvedPromptText,
  });

  return res.json({
    success: true,
    data: {
      sessionId: session._id,
      mode: session.mode,
      module: session.module,
      timeLimitSeconds: session.timeLimitSeconds,
      promptText: session.promptText,
      startedAt: session.startedAt,
    },
  });
};

exports.getSession = async (req, res) => {
  const userId = String(req.user._id);
  const session = await V2TestSession.findById(req.params.id).lean();
  if (!session || String(session.userId) !== userId) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }
  return res.json({ success: true, data: session });
};


const express = require('express');
const router = express.Router();
const Task1Result = require('../models/Task1Result');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
});

function buildPrompt({ taskType, question, essay }) {
  return `
You are an IELTS examiner. Score IELTS Writing Task 1 (${taskType}) on a 0-9 band scale.

Criteria and brief rubric:
- Task Achievement (Task 1): Clearly presents key features/trends (Academic) OR addresses the letter purpose (General). Accurate overview. Relevant comparisons and data (Academic) / Appropriate tone and format (General).
- Coherence & Cohesion: Logical organization, clear progression, effective paragraphing, cohesive devices without overuse.
- Lexical Resource: Range and accuracy of vocabulary, appropriate word choice, collocations, paraphrasing.
- Grammatical Range & Accuracy: Range of sentence structures, accuracy of tenses, agreement, punctuation.

Return JSON strictly with fields:
{
  "band": number (0-9),
  "feedback": {
    "taskAchievement": "...",
    "coherenceCohesion": "...",
    "lexicalResource": "...",
    "grammar": "...",
    "overall": "..."
  }
}

Task Type: ${taskType}
Question:
${question}

Candidate's response:
${essay}
  `.trim();
}

router.post('/writing/task1', async (req, res) => {
  try {
    const { taskType = 'academic', question = '', essay = '', userId = 'guest' } = req.body || {};
    if (!question || !essay) {
      return res.status(400).json({ error: 'Missing question or essay' });
    }

    // Skip OpenAI calls during test/deploy to prevent timeout
    if (process.env.NODE_ENV === 'test') {
      console.log('[AITask1] Skipping OpenAI call during test/deploy');
      return res.json({
        bandScore: 6.0,
        feedback: "AI analysis skipped during test/deploy",
        breakdown: {
          taskAchievement: 6.0,
          coherenceCohesion: 6.0,
          lexicalResource: 6.0,
          grammar: 6.0
        }
      });
    }

    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are an IELTS examiner. Score IELTS Writing Task 1 (${taskType}) on a 0-9 band scale. Provide detailed feedback on Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammar. Return format: "Band Score: X.X" followed by detailed feedback.`
        },
        { role: "user", content: `Task Type: ${taskType}\nQuestion: ${question}\nEssay: ${essay}` },
      ],
      temperature: 0.6,
      max_tokens: 500,
    });

    const data = response;
    const aiText = data?.choices?.[0]?.message?.content || "No feedback generated.";

    // Parse band score if available
    const bandMatch = aiText.match(/Band Score[:\s]*([0-9.]+)/i) || aiText.match(/(\d(?:\.\d)?)/);
    const score = bandMatch ? Math.max(0, Math.min(9, parseFloat(bandMatch[1]))) : 6.0;

    const saved = await Task1Result.create({
      userId: 'guest',
      taskType,
      question,
      essay,
      score,
      feedback: aiText,
      model: process.env.AI_MODEL || "gpt-4o-mini",
    });

    // Auto-update achievements
    try {
      await fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/achievements/update/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (achievementError) {
      console.log('Achievement update failed (non-critical):', achievementError.message);
    }

    // Auto-update challenge progress
    try {
      await fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/challenges/progress/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (challengeError) {
      console.log('Challenge progress update failed (non-critical):', challengeError.message);
    }

    res.json({
      message: 'Task 1 scoring complete and saved.',
      result: saved,
    });
  } catch (err) {
    console.error('Task1 error:', err);
    res.status(500).json({ error: 'Task1 scoring failed', detail: err.message });
  }
});

router.get('/writing/task1/results', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Task1Result.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Task1Result.countDocuments(),
    ]);

    res.json({
      page, limit, total, items
    });
  } catch (err) {
    console.error('Task1 history error:', err);
    res.status(500).json({ error: 'Failed to get Task1 results' });
  }
});

module.exports = router;

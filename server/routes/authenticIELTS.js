const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Helper: load JSON content safely
function loadJSON(file) {
  try {
    const filePath = path.join(process.cwd(), 'server', 'data', file);
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[authentic-ielts] Failed to load ${file}:`, err.message);
    return null;
  }
}

// GET /api/authentic-ielts/:skill
// Returns unified schema expected by MobileOptimizedTestPage
router.get('/:skill', (req, res) => {
  try {
    const { skill } = req.params;

    let data;
    switch ((skill || '').toLowerCase()) {
      case 'reading':
        data = loadJSON('realIELTSReading.json');
        if (!data) return res.status(500).json({ error: 'Failed to load reading content' });
        return res.json({
          success: true,
          data: data.passages.flatMap((passage, idx) =>
            passage.questions.map((q, i) => ({
              id: `${idx + 1}-${i + 1}`,
              title: passage.title,
              content: passage.text,
              question: q.question,
              type: q.type || 'multiple_choice',
              options: q.options || [],
            }))
          )
        });
      case 'listening':
        data = loadJSON('realIELTSListening.json');
        if (!data) return res.status(500).json({ error: 'Failed to load listening content' });
        // Map sections to unified questions with audioUrl
        return res.json({
          success: true,
          data: data.sections.flatMap((section, idx) =>
            section.questions.map((q, i) => ({
              id: `${idx + 1}-${i + 1}`,
              title: section.title || data.title,
              content: section.context || '',
              question: q.question,
              type: q.type || 'multiple_choice',
              options: q.options || [],
              transcript: section.transcript || '',
              audioUrl: section.audioFile
                ? `/api/audio/${section.audioFile}`
                : `/api/audio/ielts-listening-sample-${(idx % 4) + 1}.mp3`,
            }))
          )
        });
      case 'writing':
        data = loadJSON('realIELTSWriting.json');
        if (!data) return res.status(500).json({ error: 'Failed to load writing content' });
        return res.json({
          success: true,
          data: (data.tasks || []).map((task, idx) => ({
            id: `${idx + 1}`,
            title: task.title || `Writing Task ${idx + 1}`,
            content: task.prompt || task.description || '',
            question: task.question || 'Write your essay.',
            type: 'essay',
          }))
        });
      case 'speaking':
        data = loadJSON('realIELTSSpeaking.json');
        if (!data) return res.status(500).json({ error: 'Failed to load speaking content' });
        return res.json({
          success: true,
          data: (data.parts || []).map((part, idx) => ({
            id: `${idx + 1}`,
            title: part.title || `Speaking Part ${idx + 1}`,
            content: '',
            question: part.topic || 'Speak about the given topic.',
            type: 'short_answer',
            instructions: Array.isArray(part.questions) ? part.questions.join('\n') : (part.instructions || ''),
          }))
        });
      default:
        return res.status(400).json({ error: 'Unsupported skill. Use reading|listening|writing|speaking' });
    }
  } catch (error) {
    console.error('[authentic-ielts] Unexpected error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;



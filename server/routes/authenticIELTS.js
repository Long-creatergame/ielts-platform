const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Load real IELTS content
const contentPath = path.join(__dirname, '../data/realIELTSContent.json');
let realContent = {};

try {
  const contentData = fs.readFileSync(contentPath, 'utf8');
  realContent = JSON.parse(contentData);
} catch (error) {
  console.error('Error loading real IELTS content:', error);
}

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
        // Use real content first, fallback to old files
        if (realContent.reading) {
          const readingData = realContent.reading;
          const allPassages = [...(readingData.academic || []), ...(readingData.general || [])];
          return res.json({
            success: true,
            data: allPassages.flatMap((passage, idx) =>
              passage.questions.map((q, i) => ({
                id: `${idx + 1}-${i + 1}`,
                title: passage.title,
                content: passage.passage,
                question: q.question,
                type: q.type || 'multiple_choice',
                options: q.options || [],
                correct: q.correct,
                explanation: q.explanation
              }))
            )
          });
        }
        
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
        // Use real content first, fallback to old files
        if (realContent.listening) {
          const listeningData = realContent.listening;
          const allSections = [...(listeningData.academic || []), ...(listeningData.general || [])];
          return res.json({
            success: true,
            data: allSections.flatMap((section, idx) =>
              section.questions.map((q, i) => ({
                id: `${idx + 1}-${i + 1}`,
                title: section.title,
                content: section.transcript || '',
                question: q.question,
                type: q.type || 'multiple_choice',
                options: q.options || [],
                correct: q.correct,
                explanation: q.explanation,
                audioUrl: section.audioUrl || `/api/audio/ielts-listening-sample-${(idx % 4) + 1}.mp3`
              }))
            )
          });
        }
        
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
        // Use real content first, fallback to old files
        if (realContent.writing) {
          const writingData = realContent.writing;
          const allTasks = [...(writingData.task1 || []), ...(writingData.task2 || [])];
          return res.json({
            success: true,
            data: allTasks.map((task, idx) => ({
              id: `${idx + 1}`,
              title: task.title,
              content: task.description,
              question: task.description,
              type: task.type === 'academic' ? 'essay' : 'letter',
              wordCount: task.wordCount,
              timeLimit: task.timeLimit,
              difficulty: task.difficulty
            }))
          });
        }
        
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
        // Use real content first, fallback to old files
        if (realContent.speaking) {
          const speakingData = realContent.speaking;
          const allParts = [...(speakingData.part1 || []), ...(speakingData.part2 || []), ...(speakingData.part3 || [])];
          return res.json({
            success: true,
            data: allParts.map((part, idx) => ({
              id: `${idx + 1}`,
              title: part.topic || `Speaking Part ${idx + 1}`,
              content: '',
              question: part.topic || 'Speak about the given topic.',
              type: 'short_answer',
              instructions: Array.isArray(part.questions) ? part.questions.join('\n') : (part.cueCard || ''),
              timeLimit: part.timeLimit || part.speakingTime,
              difficulty: part.difficulty
            }))
          });
        }
        
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



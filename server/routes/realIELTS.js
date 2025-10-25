const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// GET /api/real-ielts/status
router.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Real IELTS routes are working',
    availableTests: ['reading', 'listening', 'writing', 'speaking'],
    timestamp: new Date().toISOString()
  });
});

// Load real IELTS data
const loadIELTSData = (filename) => {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
};

// GET /api/reading/real-ielts
router.get('/reading/real-ielts', (req, res) => {
  try {
    const readingData = loadIELTSData('realIELTSReading.json');
    if (!readingData) {
      return res.status(500).json({ error: 'Failed to load reading data' });
    }
    
    res.json({
      title: readingData.title,
      duration: readingData.duration,
      instructions: readingData.instructions,
      passages: readingData.passages,
      totalQuestions: readingData.passages.reduce((total, passage) => total + passage.questions.length, 0)
    });
  } catch (error) {
    console.error('Reading data error:', error);
    res.status(500).json({ error: 'Failed to load reading test' });
  }
});

// GET /api/listening/real-ielts
router.get('/listening/real-ielts', (req, res) => {
  try {
    const listeningData = loadIELTSData('realIELTSListening.json');
    if (!listeningData) {
      return res.status(500).json({ error: 'Failed to load listening data' });
    }
    
    res.json({
      title: listeningData.title,
      duration: listeningData.duration,
      instructions: listeningData.instructions,
      sections: listeningData.sections,
      totalQuestions: listeningData.sections.reduce((total, section) => total + section.questions.length, 0)
    });
  } catch (error) {
    console.error('Listening data error:', error);
    res.status(500).json({ error: 'Failed to load listening test' });
  }
});

// GET /api/writing/real-ielts
router.get('/writing/real-ielts', (req, res) => {
  try {
    const writingData = loadIELTSData('realIELTSWriting.json');
    if (!writingData) {
      return res.status(500).json({ error: 'Failed to load writing data' });
    }
    
    res.json({
      title: writingData.title,
      duration: writingData.duration,
      instructions: writingData.instructions,
      tasks: writingData.tasks,
      additionalTasks: writingData.additionalTasks
    });
  } catch (error) {
    console.error('Writing data error:', error);
    res.status(500).json({ error: 'Failed to load writing test' });
  }
});

// GET /api/speaking/real-ielts
router.get('/speaking/real-ielts', (req, res) => {
  try {
    const speakingData = loadIELTSData('realIELTSSpeaking.json');
    if (!speakingData) {
      return res.status(500).json({ error: 'Failed to load speaking data' });
    }
    
    res.json({
      title: speakingData.title,
      duration: speakingData.duration,
      instructions: speakingData.instructions,
      parts: speakingData.parts,
      assessmentCriteria: speakingData.assessmentCriteria
    });
  } catch (error) {
    console.error('Speaking data error:', error);
    res.status(500).json({ error: 'Failed to load speaking test' });
  }
});

module.exports = router;

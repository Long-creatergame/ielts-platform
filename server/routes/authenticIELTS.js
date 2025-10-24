import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Load authentic IELTS content
const loadAuthenticContent = () => {
  try {
    const contentPath = path.join(__dirname, '../data/authenticIELTS.json');
    const content = fs.readFileSync(contentPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading authentic IELTS content:', error);
    return null;
  }
};

// GET /authentic-ielts/reading - Get authentic reading passages
router.get('/reading', (req, res) => {
  try {
    const content = loadAuthenticContent();
    if (!content || !content.reading) {
      return res.status(404).json({ error: 'Authentic reading content not found' });
    }

    res.json({
      success: true,
      data: content.reading.passages
    });
  } catch (error) {
    console.error('Error fetching authentic reading content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /authentic-ielts/listening - Get authentic listening sections
router.get('/listening', (req, res) => {
  try {
    const content = loadAuthenticContent();
    if (!content || !content.listening) {
      return res.status(404).json({ error: 'Authentic listening content not found' });
    }

    res.json({
      success: true,
      data: content.listening.sections
    });
  } catch (error) {
    console.error('Error fetching authentic listening content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /authentic-ielts/writing - Get authentic writing tasks
router.get('/writing', (req, res) => {
  try {
    const content = loadAuthenticContent();
    if (!content || !content.writing) {
      return res.status(404).json({ error: 'Authentic writing content not found' });
    }

    res.json({
      success: true,
      data: content.writing
    });
  } catch (error) {
    console.error('Error fetching authentic writing content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /authentic-ielts/speaking - Get authentic speaking topics
router.get('/speaking', (req, res) => {
  try {
    const content = loadAuthenticContent();
    if (!content || !content.speaking) {
      return res.status(404).json({ error: 'Authentic speaking content not found' });
    }

    res.json({
      success: true,
      data: content.speaking
    });
  } catch (error) {
    console.error('Error fetching authentic speaking content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /authentic-ielts/complete - Get all authentic content
router.get('/complete', (req, res) => {
  try {
    const content = loadAuthenticContent();
    if (!content) {
      return res.status(404).json({ error: 'Authentic IELTS content not found' });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching complete authentic content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

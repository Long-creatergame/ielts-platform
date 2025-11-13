const express = require('express');
const auth = require('../middleware/authMiddleware');
const { start, submit, result, listSessions, patchSession } = require('../controllers/examController');

const router = express.Router();

router.post('/start', auth, async (req, res) => {
  try {
    await start(req, res);
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start exam',
      error: error.message
    });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    await submit(req, res);
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit exam',
      error: error.message
    });
  }
});

router.get('/result/:id', auth, async (req, res) => {
  try {
    await result(req, res);
  } catch (error) {
    console.error('Get exam result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exam result',
      error: error.message
    });
  }
});

router.get('/sessions', auth, async (req, res) => {
  try {
    await listSessions(req, res);
  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list sessions',
      error: error.message
    });
  }
});

router.get('/recent', auth, async (req, res) => {
  try {
    await listSessions(req, res);
  } catch (error) {
    console.error('List recent sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list recent sessions',
      error: error.message
    });
  }
});

router.patch('/patch/:id', auth, async (req, res) => {
  try {
    await patchSession(req, res);
  } catch (error) {
    console.error('Patch session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to patch session',
      error: error.message
    });
  }
});

module.exports = router;



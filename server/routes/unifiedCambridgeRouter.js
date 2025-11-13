const express = require('express');
const auth = require('../middleware/authMiddleware');
const { startTest, submitTest, getHistory, getTestBySkill } = require('../controllers/cambridgeController');

const router = express.Router();

// POST /api/cambridge/start
router.post('/start', auth, async (req, res) => {
  try {
    await startTest(req, res);
  } catch (error) {
    console.error('Start Cambridge test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start Cambridge test',
      error: error.message
    });
  }
});

// POST /api/cambridge/submit
router.post('/submit', auth, async (req, res) => {
  try {
    await submitTest(req, res);
  } catch (error) {
    console.error('Submit Cambridge test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit Cambridge test',
      error: error.message
    });
  }
});

// GET /api/cambridge/history/:userId
router.get('/history/:userId', auth, async (req, res) => {
  try {
    await getHistory(req, res);
  } catch (error) {
    console.error('Get Cambridge history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Cambridge history',
      error: error.message
    });
  }
});

// GET /api/cambridge/test/:skill
router.get('/test/:skill', async (req, res) => {
  try {
    await getTestBySkill(req, res);
  } catch (error) {
    console.error('Get Cambridge test by skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Cambridge test',
      error: error.message
    });
  }
});

module.exports = router;


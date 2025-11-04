const express = require('express');
const auth = require('../middleware/auth');
const { startTest, submitTest, getHistory, getTestBySkill } = require('../controllers/cambridgeController');

const router = express.Router();

// POST /api/cambridge/start
router.post('/start', auth, startTest);

// POST /api/cambridge/submit
router.post('/submit', auth, submitTest);

// GET /api/cambridge/history/:userId
router.get('/history/:userId', auth, getHistory);

// GET /api/cambridge/test/:skill
router.get('/test/:skill', getTestBySkill);

module.exports = router;


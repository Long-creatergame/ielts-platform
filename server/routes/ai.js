const express = require('express');
const { aiScore, getTestResults, scoreEssay } = require('../controllers/ai.controller');

const router = express.Router();

// AI scoring endpoint (no auth for testing)
router.post('/score', aiScore);

// Direct essay scoring endpoint (no auth required for testing)
router.post('/essay', scoreEssay);

// Get test results (no auth for testing)
router.get('/results/:userId?', getTestResults);

module.exports = router;


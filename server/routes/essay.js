const express = require('express');
const { scoreEssay } = require('../controllers/ai.controller');
const EssayResult = require('../models/EssayResult');

const router = express.Router();

router.post('/essay', scoreEssay);

// GET: view all saved essays
router.get('/essay/results', async (req, res) => {
  try {
    const results = await EssayResult.find().sort({ createdAt: -1 }).limit(20);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load essay results' });
  }
});

module.exports = router;

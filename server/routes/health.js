const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState; // 1 connected, 2 connecting
    res.json({
      success: true,
      ok: true,
      uptime: process.uptime(),
      db: dbState,
      env: {
        openai: !!process.env.OPENAI_API_KEY,
      },
      version: process.env.GIT_SHA || 'unknown'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

module.exports = router;



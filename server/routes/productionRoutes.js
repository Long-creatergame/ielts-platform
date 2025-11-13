const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      status: 'ok',
      uptime: process.uptime(),
      version: '2.16',
      mode: process.env.NODE_ENV,
      demo: process.env.ENABLE_DEMO_MODE === 'true'
    });
  } catch (error) {
    console.error('Production status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get production status',
      error: error.message
    });
  }
});

router.post('/reset-demo', async (req, res) => {
  try {
    if (process.env.ENABLE_DEMO_MODE !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'Demo mode not enabled'
      });
    }
    return res.json({
      success: true,
      message: 'Demo data reset successful!'
    });
  } catch (error) {
    console.error('Reset demo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset demo',
      error: error.message
    });
  }
});

module.exports = router;



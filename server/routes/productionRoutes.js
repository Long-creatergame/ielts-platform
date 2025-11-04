const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    version: '2.16',
    mode: process.env.NODE_ENV,
    demo: process.env.ENABLE_DEMO_MODE === 'true'
  });
});

router.post('/reset-demo', async (req, res) => {
  if (process.env.ENABLE_DEMO_MODE !== 'true') {
    return res.status(403).json({ message: 'Demo mode not enabled' });
  }
  return res.json({ message: 'Demo data reset successful!' });
});

module.exports = router;



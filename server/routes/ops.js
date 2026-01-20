const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

function getVersion() {
  return (
    process.env.GIT_SHA ||
    process.env.RENDER_GIT_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    'unknown'
  );
}

// Fast, uptime-robot friendly. Must NOT depend on DB.
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: getVersion(),
    uptime: process.uptime(),
  });
});

// Lightweight readiness check. OK to check Mongo connection state.
router.get('/ready', (req, res) => {
  const ok = mongoose.connection.readyState === 1;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'fail',
    timestamp: new Date().toISOString(),
    db: { ok },
  });
});

// Optional alias for uptime monitors.
router.get('/uptime', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: getVersion(),
    uptime: process.uptime(),
  });
});

module.exports = router;


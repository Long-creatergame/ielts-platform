const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', async (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 connected, 2 connecting
  res.json({
    ok: true,
    uptime: process.uptime(),
    db: dbState,
    env: {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      email: !!(process.env.SENDGRID_API_KEY || (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS)),
    },
    version: process.env.GIT_SHA || 'unknown'
  });
});

module.exports = router;



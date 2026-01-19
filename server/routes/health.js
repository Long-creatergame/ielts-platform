const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: {
      ok: dbOk,
    },
  });
});

module.exports = router;



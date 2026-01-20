const express = require('express');

const sessionsRoutes = require('./sessions');
const writingRoutes = require('./writing');
const speakingRoutes = require('./speaking');
const profileRoutes = require('./profile');

const router = express.Router();

router.use('/sessions', sessionsRoutes);
router.use('/writing', writingRoutes);
router.use('/speaking', speakingRoutes);
router.use('/profile', profileRoutes);

module.exports = router;


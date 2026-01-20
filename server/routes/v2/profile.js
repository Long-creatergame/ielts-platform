const express = require('express');
const auth = require('../../middleware/authMiddleware');

const { getMyProfile } = require('../../v2/controllers/profileController');

const router = express.Router();

router.get('/me', auth, getMyProfile);

module.exports = router;


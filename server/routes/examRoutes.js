const express = require('express');
const auth = require('../middleware/auth');
const { start, submit, result, listSessions, patchSession } = require('../controllers/examController');

const router = express.Router();

router.post('/start', auth, start);
router.post('/submit', auth, submit);
router.get('/result/:id', auth, result);
router.get('/sessions', auth, listSessions);
router.get('/recent', auth, listSessions); // Alias for /sessions for compatibility
router.patch('/patch/:id', auth, patchSession);

module.exports = router;



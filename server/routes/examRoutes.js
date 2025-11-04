const express = require('express');
const auth = require('../middleware/auth');
const { start, submit, result } = require('../controllers/examController');

const router = express.Router();

router.post('/start', auth, start);
router.post('/submit', auth, submit);
router.get('/result/:id', auth, result);

module.exports = router;



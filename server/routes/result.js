const express = require('express');
const { saveResult, getUserResults } = require('../controllers/result.controller');

const router = express.Router();
router.post('/', saveResult);
router.get('/:userId', getUserResults);
module.exports = router;

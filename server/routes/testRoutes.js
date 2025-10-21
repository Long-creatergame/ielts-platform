const express = require('express');
const { startTest, submitTest, getTestHistory } = require('../controllers/testController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Test routes
router.post('/start', startTest);
router.post('/submit', submitTest);
router.get('/history', getTestHistory);

module.exports = router;

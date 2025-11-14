const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, responseController.submitResponse);
router.get('/user/:userId', authMiddleware, responseController.getUserResponses);
router.get('/:id', authMiddleware, responseController.getResponseById);

module.exports = router;


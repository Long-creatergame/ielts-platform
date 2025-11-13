const express = require('express');
const router = express.Router();
const {
  submitResponse,
  getUserResponses,
  getResponseById
} = require('../controllers/responseController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, submitResponse);
router.get('/', authMiddleware, getUserResponses);
router.get('/:id', authMiddleware, getResponseById);

module.exports = router;


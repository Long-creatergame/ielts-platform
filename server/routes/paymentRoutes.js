const express = require('express');
const { createPayment, unlockTest } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Payment routes
router.post('/create', createPayment);
router.post('/unlock', unlockTest);

module.exports = router;

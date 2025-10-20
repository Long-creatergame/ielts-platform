const express = require('express');
const auth = require('../middleware/auth');
const { 
  createCheckoutSession, 
  handleStripeWebhook, 
  getPaymentStatus 
} = require('../controllers/payment.controller');

const router = express.Router();

// Create checkout session (protected)
router.post('/create-session', auth, createCheckoutSession);

// Get payment status (protected)
router.get('/status', auth, getPaymentStatus);

// Stripe webhook (no auth needed, uses signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;


const express = require('express');
const User = require('../models/User');

// Initialize Stripe only if API key is available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/payment/plans - Get pricing plans from Stripe
router.get('/plans', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }

    // List active prices with product data
    const prices = await stripe.prices.list({ active: true, expand: ['data.product'], limit: 50 });

    const plans = prices.data
      .filter((p) => p.type === 'one_time' || p.recurring) // support both one-time and subscriptions
      .map((price) => ({
        id: price.id,
        name: typeof price.product === 'object' ? price.product.name : 'Plan',
        price: price.unit_amount,
        currency: price.currency,
        interval: price.recurring ? price.recurring.interval : 'one_time',
        description: typeof price.product === 'object' ? price.product.description : '',
        features: [],
      }));

    return res.json({ success: true, plans });
  } catch (error) {
    console.error('Fetch Stripe plans error:', error);
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
});

// POST /api/payment/create - Create Stripe payment session
router.post('/create', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        message: 'Payment service not configured. Please contact support.' 
      });
    }

    const { planId } = req.body;
    const user = req.user;

    // Define pricing plans
    const plans = {
      standard: { price: 129000, name: 'Standard Plan' },
      premium: { price: 249000, name: 'Premium Plan' },
      ultimate: { price: 499000, name: 'Ultimate Plan' }
    };

    const selectedPlan = plans[planId];
    if (!selectedPlan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: selectedPlan.name,
              description: `IELTS Platform - ${selectedPlan.name}`,
            },
            unit_amount: selectedPlan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        planId: planId
      }
    });

    res.json({
      message: 'Payment session created successfully',
      sessionId: session.id,
      paymentUrl: session.url
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/payment/verify - Verify Stripe payment
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        message: 'Payment service not configured. Please contact support.' 
      });
    }

    const { sessionId } = req.body;
    const user = req.user;

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Update user subscription
    user.plan = 'paid';
    user.subscriptionPlan = session.metadata.planId;
    user.subscriptionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    user.stripeCustomerId = session.customer;
    user.stripeSubscriptionId = session.subscription;
    await user.save();

    res.json({
      message: 'Payment verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpires: user.subscriptionExpires
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/payment/webhook - Stripe webhook handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Payment service not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment succeeded:', session.id);
      // Handle successful payment
      break;
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      console.log('Subscription updated:', subscription.id);
      // Handle subscription update
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('Subscription cancelled:', deletedSubscription.id);
      // Handle subscription cancellation
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

module.exports = router;
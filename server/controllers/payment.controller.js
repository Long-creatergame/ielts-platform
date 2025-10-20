const stripe = require('../utils/stripe');
const User = require('../models/User');
const config = require('../config');

// Create Stripe Checkout Session
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: 'IELTS Test Access (Full)',
            description: 'Unlimited access to all IELTS test modules'
          },
          unit_amount: 999, // $9.99
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${config.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.CLIENT_URL}/payment-cancel`,
      metadata: { 
        userId: userId.toString()
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Handle Stripe Webhook
const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      config.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;

      // Update user to paid plan
      await User.findByIdAndUpdate(userId, {
        plan: 'paid',
        isTrialUsed: true,
        $push: { 
          payments: { 
            method: 'Stripe', 
            amount: session.amount_total / 100,
            stripeSessionId: session.id
          } 
        }
      });

      console.log(`Payment successful for user ${userId}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook error: ${error.message}`);
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    res.json({
      plan: user.plan,
      isTrialUsed: user.isTrialUsed,
      payments: user.payments
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
  getPaymentStatus
};


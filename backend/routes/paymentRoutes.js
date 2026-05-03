const express = require('express');
const router = express.Router();
// Use process.env directly. Make sure STRIPE_SECRET_KEY is in your .env file.
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Event = require('../models/Event');

router.post('/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured on the server. Please add STRIPE_SECRET_KEY to your .env file.' });
  }
  try {
    const { eventId, ticketQuantity } = req.body;
    // For now we mock the event details since we might not have it in DB,
    // but typically you would fetch the event:
    // const event = await Event.findById(eventId);
    // if (!event) return res.status(404).json({ error: 'Event not found' });
    
    // Using mock data for demonstration
    const event = {
      title: 'The Metropol Charity Gala',
      price: 299,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: event.title,
              images: [event.image],
            },
            unit_amount: event.price * 100, // Stripe expects amount in cents
          },
          quantity: ticketQuantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/events/${eventId}?canceled=true`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

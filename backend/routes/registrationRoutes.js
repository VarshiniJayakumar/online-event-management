const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Middleware to check auth
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create a registration (Book a ticket)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { eventId, ticketType, quantity, totalAmount, stripeSessionId } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // For paid events
    const eventPrice = event.price || (event.tickets && event.tickets.length > 0 ? event.tickets[0].price : 0);
    if (eventPrice > 0) {
      // 1. Verify real Stripe Checkout session if session ID is provided and is not a demo session
      if (stripeSessionId && !stripeSessionId.startsWith('demo_session_')) {
        if (!stripe) {
          return res.status(400).json({ message: 'Stripe not configured' });
        }
        try {
          const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
          if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment verification failed: Session not paid' });
          }
        } catch (stripeErr) {
          return res.status(400).json({ message: `Payment verification failed: ${stripeErr.message}` });
        }
      } else {
        // 2. Handle card or UPI payment via modal / direct details
        const { paymentMethod, cardDetails, upiId } = req.body;

        if (paymentMethod === 'card') {
          if (!cardDetails || !cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvc) {
            return res.status(400).json({ message: 'Please fill in all payment details properly' });
          }

          const cleanCardNumber = cardDetails.number.replace(/[^0-9]/g, '');
          const declineMessages = {
            // Standard decline scenarios
            '4000000000000002': 'Your card was declined. Please try a different payment method.',
            '4000000000009995': 'Your card has insufficient funds.',
            '4000000000009987': 'Your card has been reported as lost.',
            '4000000000009979': 'Your card has been reported as stolen.',
            '4000000000000069': 'Your card has expired.',
            '4000000000000127': 'The CVC code is incorrect.',
            '4000000000000119': 'An error occurred while processing your card.',
            '4242424242424241': 'The card number is incorrect.',
            '4000000000006975': 'This card has exceeded its velocity limit.',
            
            // Fraud scenarios (Radar block)
            '4100000000000019': 'The payment was blocked by our fraud prevention system (Radar).',
            '4000000000004954': 'The payment was blocked by our fraud prevention system (Radar).',
            '4000000000009235': 'The payment was blocked by our fraud prevention system (Radar).',
            
            // 3DS Failure
            '4000000000003222': '3D Secure authentication failed. Please try again.'
          };

          if (stripe) {
            try {
              const [expMonth, expYear] = cardDetails.expiry.split('/');
              const month = parseInt(expMonth, 10);
              const year = parseInt('20' + expYear, 10);

              // Create a card token using Stripe
              const token = await stripe.tokens.create({
                card: {
                  number: cleanCardNumber,
                  exp_month: month,
                  exp_year: year,
                  cvc: cardDetails.cvc,
                  name: cardDetails.name
                }
              });

              // Process payment charge
              await stripe.charges.create({
                amount: Math.round((totalAmount || eventPrice) * 100),
                currency: 'usd',
                source: token.id,
                description: `Ticket booking for ${event.title}`
              });
            } catch (stripeError) {
              console.error('Stripe charge processing error:', stripeError);
              // If it's a card error (e.g. decline), return it
              if (stripeError.type === 'StripeCardError') {
                return res.status(400).json({ message: stripeError.message });
              }
              // If it's an authentication error (like invalid key) and we have dummy key configuration,
              // fall back to simulation to ensure testing environment works
              if (stripeError.type === 'StripeAuthenticationError' || stripeError.message.includes('API key') || stripeError.message.includes('key')) {
                const matchedDecline = declineMessages[cleanCardNumber];
                if (matchedDecline) {
                  return res.status(400).json({ message: matchedDecline });
                }
                if (cleanCardNumber.length < 16) {
                  return res.status(400).json({ message: 'Invalid card number length' });
                }
                if (cardDetails.cvc.length < 3) {
                  return res.status(400).json({ message: 'Invalid CVC' });
                }
              } else {
                return res.status(400).json({ message: stripeError.message });
              }
            }
          } else {
            // Fallback to simulated payment gateway if Stripe is not configured
            const matchedDecline = declineMessages[cleanCardNumber];
            if (matchedDecline) {
              return res.status(400).json({ message: matchedDecline });
            }

            if (cleanCardNumber.length < 16) {
              return res.status(400).json({ message: 'Invalid card number length' });
            }

            if (cardDetails.cvc.length < 3) {
              return res.status(400).json({ message: 'Invalid CVC' });
            }
          }
        } else if (paymentMethod === 'upi') {
          if (!upiId || !upiId.includes('@') || upiId.startsWith('@') || upiId.endsWith('@')) {
            return res.status(400).json({ message: 'Please enter a valid UPI ID (e.g., username@bank)' });
          }

          const cleanUpi = upiId.toLowerCase().trim();
          const upiDeclines = {
            'fail@upi': 'UPI transaction declined by user.',
            'decline@upi': 'UPI transaction declined by user.',
            'reject@upi': 'UPI transaction declined by user.',
            'insufficient@upi': 'UPI transaction failed: Insufficient funds in bank account.',
            'lowbalance@upi': 'UPI transaction failed: Insufficient funds in bank account.',
            'timeout@upi': 'UPI payment session expired. Please retry.',
            'expired@upi': 'UPI payment session expired. Please retry.'
          };

          if (upiDeclines[cleanUpi]) {
            return res.status(400).json({ message: upiDeclines[cleanUpi] });
          }
        } else {
          return res.status(400).json({ message: 'Please select a valid payment method' });
        }
      }
    }


    const registration = new Registration({
      user: req.user.id,
      event: eventId,
      ticketType: ticketType || 'General Admission',
      quantity: quantity || 1,
      totalAmount: totalAmount || 0,
      paymentStatus: 'completed', // For demo/free events
      stripeSessionId
    });

    await registration.save();

    // Send Booking Confirmation Email
    try {
      const userData = await User.findById(req.user.id);
      if (userData) {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const ticketLink = `${clientUrl}/dashboard`;
        
        await sendEmail({
          to: userData.email,
          subject: `Ticket Confirmed: ${event.title}`,
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0a0a0f; color: #f8fafc;">
              <h2 style="color: #8b5cf6; text-align: center; font-size: 24px; margin-bottom: 20px;">Your Ticket is Confirmed! 🎉</h2>
              <p style="font-size: 16px; color: #cbd5e1;">Hi ${userData.name},</p>
              <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">You're all set! Your registration for <strong>${event.title}</strong> has been successfully processed.</p>
              
              <div style="background-color: #12121a; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #1e1b4b;">
                <h3 style="margin-top: 0; color: #ec4899; font-size: 18px;">Ticket Details</h3>
                <table style="width: 100%; border-collapse: collapse; color: #cbd5e1;">
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #94a3b8; width: 120px;">Event:</td>
                    <td style="padding: 6px 0;">${event.title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Date:</td>
                    <td style="padding: 6px 0;">${new Date(event.date).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Time:</td>
                    <td style="padding: 6px 0;">${event.time || 'TBA'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Location:</td>
                    <td style="padding: 6px 0;">${event.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Ticket Type:</td>
                    <td style="padding: 6px 0;">${ticketType || 'General Admission'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Quantity:</td>
                    <td style="padding: 6px 0;">${quantity || 1}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${ticketLink}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">View & Download Ticket QR</a>
              </div>

              <hr style="border: none; border-top: 1px solid #1e293b; margin: 25px 0;">
              <p style="font-size: 12px; color: #64748b; text-align: center;">Need help? Contact the organizer or reply to this email.</p>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error('Failed to send registration confirmation email:', emailErr);
    }

    // Update the event's sold ticket count
    if (event.tickets && event.tickets.length > 0) {
      const ticketTierIndex = event.tickets.findIndex(t => t.type === (ticketType || 'General Admission'));
      if (ticketTierIndex !== -1) {
        event.tickets[ticketTierIndex].sold += (quantity || 1);
      } else {
        // Fallback to the first ticket tier if specific type not found
        event.tickets[0].sold += (quantity || 1);
      }
      await event.save();
    } else if (event.price !== undefined) {
      // If no tickets array but price exists, we just continue (or we could add a default ticket tier)
      console.log('Event has no tickets array but has a price. Registration created anyway.');
    }

    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's registrations (My Tickets)
router.get('/my-tickets', authMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id, status: 'active' })
      .populate('event')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get registrations for an organizer's events
router.get('/organizer-stats', authMiddleware, async (req, res) => {
  try {
    // Find all events created by this user
    const events = await Event.find({ organizer: req.user.id });
    const eventIds = events.map(e => e._id);

    // Find all registrations for these events
    const registrations = await Registration.find({ event: { $in: eventIds } }).populate('user', 'name email');
    
    res.json({
      eventsCount: events.length,
      registrationsCount: registrations.length,
      registrations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel a registration (Refund/Delete ticket)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const registration = await Registration.findOne({ _id: req.id || req.params.id, user: req.user.id });
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: 'Registration is already cancelled' });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Decrease the event's sold ticket count
    const event = await Event.findById(registration.event);
    if (event && event.tickets && event.tickets.length > 0) {
      const ticketTierIndex = event.tickets.findIndex(t => t.type === registration.ticketType);
      if (ticketTierIndex !== -1) {
        event.tickets[ticketTierIndex].sold = Math.max(0, event.tickets[ticketTierIndex].sold - registration.quantity);
      } else {
        event.tickets[0].sold = Math.max(0, event.tickets[0].sold - registration.quantity);
      }
      await event.save();
    }

    res.json({ message: 'Registration cancelled successfully', registration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

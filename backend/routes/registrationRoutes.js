const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');

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

    // For paid events using simulated checkout (demo mode)
    const eventPrice = event.price || (event.tickets && event.tickets.length > 0 ? event.tickets[0].price : 0);
    if (eventPrice > 0 && (!stripeSessionId || stripeSessionId.startsWith('demo_session_'))) {
      const { paymentMethod, cardDetails, upiId } = req.body;

      if (paymentMethod === 'card') {
        if (!cardDetails || !cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvc) {
          return res.status(400).json({ message: 'Please fill in all payment details properly' });
        }

        const cleanCardNumber = cardDetails.number.replace(/\s+/g, '');
        const declineMessages = {
          '4000000000000002': 'Your card was declined. Please try a different payment method.',
          '4000000000009995': 'Your card has insufficient funds.',
          '4000000000009987': 'Your card has been reported as lost.',
          '4000000000009979': 'Your card has been reported as stolen.',
          '4000000000000069': 'Your card has expired.',
          '4000000000000127': 'The CVC code is incorrect.',
          '4000000000000119': 'An error occurred while processing your card.',
          '4242424242424241': 'The card number is incorrect.',
          '4000000000006975': 'This card has exceeded its velocity limit.'
        };

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
      } else if (paymentMethod === 'upi') {
        if (!upiId || upiId.length < 3) {
          return res.status(400).json({ message: 'Please enter a valid UPI ID' });
        }
      } else {
        return res.status(400).json({ message: 'Please select a valid payment method' });
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

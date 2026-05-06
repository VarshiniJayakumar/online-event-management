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
    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's registrations (My Tickets)
router.get('/my-tickets', authMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
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

module.exports = router;

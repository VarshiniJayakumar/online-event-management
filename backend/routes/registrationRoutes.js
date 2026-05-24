const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Auth middleware
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

// POST /api/registrations — Free event registration only
// Paid events must go through /api/payment/create-order → /api/payment/verify-payment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { eventId, ticketType, quantity } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventPrice = event.price || (event.tickets && event.tickets.length > 0 ? event.tickets[0].price : 0);

    // Block paid events from using this route
    if (eventPrice > 0) {
      return res.status(400).json({
        message: 'Paid events must be registered via the Razorpay payment flow.'
      });
    }

    const qty = quantity || 1;
    const registration = new Registration({
      user: req.user.id,
      event: eventId,
      ticketType: ticketType || 'General Admission',
      quantity: qty,
      totalAmount: 0,
      paymentStatus: 'completed'
    });

    await registration.save();

    // Update sold count
    if (event.tickets && event.tickets.length > 0) {
      const tierIndex = event.tickets.findIndex(t => t.type === (ticketType || 'General Admission'));
      if (tierIndex !== -1) {
        event.tickets[tierIndex].sold += qty;
      } else {
        event.tickets[0].sold += qty;
      }
      await event.save();
    }

    // Send confirmation email
    try {
      const userData = await User.findById(req.user.id);
      if (userData) {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        await sendEmail({
          to: userData.email,
          subject: `Ticket Confirmed: ${event.title}`,
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0a0a0f; color: #f8fafc;">
              <h2 style="color: #8b5cf6; text-align: center; font-size: 24px; margin-bottom: 20px;">Your Ticket is Confirmed! 🎉</h2>
              <p style="font-size: 16px; color: #cbd5e1;">Hi ${userData.name},</p>
              <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">You're registered for <strong>${event.title}</strong>. This is a free event — no payment required.</p>
              <div style="background-color: #12121a; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #1e1b4b;">
                <h3 style="margin-top: 0; color: #ec4899; font-size: 18px;">Ticket Details</h3>
                <table style="width: 100%; border-collapse: collapse; color: #cbd5e1;">
                  <tr><td style="padding: 6px 0; font-weight: bold; color: #94a3b8; width: 120px;">Event:</td><td>${event.title}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Date:</td><td>${new Date(event.date).toLocaleDateString()}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Time:</td><td>${event.time || 'TBA'}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Location:</td><td>${event.location}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Quantity:</td><td>${qty}</td></tr>
                </table>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${clientUrl}/dashboard" style="background-color: #7c3aed; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">View My Tickets</a>
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

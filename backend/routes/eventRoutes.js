const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Middleware to check auth (simple version for now)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
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

// Get all events
router.get('/', async (req, res) => {
  try {
    const { search, category, location } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = { $regex: `^${category}$`, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };

    const events = await Event.find(query).populate('organizer', 'name email');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's own events (for organizer)
router.get('/my-events/managed', authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only organizers can create events' });
    }
    const event = new Event({ ...req.body, organizer: req.user.id });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Send Reminder to all attendees
router.post('/:id/remind', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Auth check: Only event organizer or admin can trigger reminders
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Only the organizer can send reminders' });
    }

    // Find all active registrations for this event
    const registrations = await Registration.find({ event: event._id, status: 'active' }).populate('user', 'name email');
    if (registrations.length === 0) {
      return res.status(400).json({ message: 'No registered attendees found for this event.' });
    }

    // Deduplicate users
    const usersMap = new Map();
    registrations.forEach(reg => {
      if (reg.user && reg.user.email) {
        usersMap.set(reg.user.email, reg.user.name || 'Attendee');
      }
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const eventUrl = `${clientUrl}/events/${event._id}`;
    let successCount = 0;

    for (const [email, name] of usersMap.entries()) {
      try {
        await sendEmail({
          to: email,
          subject: `Reminder: ${event.title} is coming up! ⏰`,
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0a0a0f; color: #f8fafc;">
              <h2 style="color: #ec4899; text-align: center; font-size: 24px; margin-bottom: 20px;">Event Reminder ⏰</h2>
              <p style="font-size: 16px; color: #cbd5e1;">Hi ${name},</p>
              <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">This is a friendly reminder that the event <strong>${event.title}</strong> is starting soon!</p>
              
              <div style="background-color: #12121a; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #1e1b4b;">
                <h3 style="margin-top: 0; color: #7c3aed; font-size: 18px;">Event details</h3>
                <p style="margin: 6px 0; color: #cbd5e1;"><strong style="color: #94a3b8;">Event:</strong> ${event.title}</p>
                <p style="margin: 6px 0; color: #cbd5e1;"><strong style="color: #94a3b8;">Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p style="margin: 6px 0; color: #cbd5e1;"><strong style="color: #94a3b8;">Time:</strong> ${event.time || 'TBA'}</p>
                <p style="margin: 6px 0; color: #cbd5e1;"><strong style="color: #94a3b8;">Location:</strong> ${event.location}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${eventUrl}" style="background-color: #ec4899; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);">View Event Page</a>
              </div>

              <hr style="border: none; border-top: 1px solid #1e293b; margin: 25px 0;">
              <p style="font-size: 12px; color: #64748b; text-align: center;">You received this because you registered for this event on Eventure.</p>
            </div>
          `
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to send reminder email to ${email}:`, err);
      }
    }

    res.json({ message: `Successfully sent reminders to ${successCount} attendees.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

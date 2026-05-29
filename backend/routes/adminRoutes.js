const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');

// Admin Auth Middleware
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get Dashboard Stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const pendingRequests = await User.countDocuments({ organizerStatus: 'pending' });
    
    res.json({ totalUsers, totalEvents, pendingRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all organizer requests
router.get('/organizer-requests', adminAuth, async (req, res) => {
  try {
    const requests = await User.find({ organizerStatus: 'pending' }).select('-password');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve organizer request
router.post('/approve-organizer/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = 'organizer';
    user.organizerStatus = 'approved';
    await user.save();

    // Send approval email
    const { sendEmail } = require('../utils/emailService');
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await sendEmail({
      to: user.email,
      subject: '🎉 You are now an Organizer on Eventure!',
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0a0a0f; color: #f8fafc;">
          <h2 style="color: #8b5cf6; text-align: center; font-size: 24px; margin-bottom: 20px;">Congratulations! 🎉</h2>
          <p style="font-size: 16px; color: #cbd5e1;">Hi ${user.name},</p>
          <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">
            Great news! Your organizer application has been <strong style="color: #22c55e;">approved</strong> by the Eventure admin team.
            You can now create and manage events on our platform.
          </p>
          <div style="background-color: #12121a; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #1e1b4b;">
            <h3 style="margin-top: 0; color: #ec4899; font-size: 18px;">What you can do now:</h3>
            <ul style="color: #cbd5e1; line-height: 2;">
              <li>✅ Create and publish events</li>
              <li>✅ Manage ticket sales</li>
              <li>✅ View attendee registrations</li>
              <li>✅ Track event analytics</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${clientUrl}/create-event" style="background-color: #7c3aed; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">Create Your First Event</a>
          </div>
          <hr style="border: none; border-top: 1px solid #1e293b; margin: 25px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">Welcome to the Eventure organizer community!</p>
        </div>
      `
    });

    res.json({ message: 'Organizer approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject organizer request
router.post('/reject-organizer/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.organizerStatus = 'rejected';
    await user.save();

    // Send rejection email
    const { sendEmail } = require('../utils/emailService');
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await sendEmail({
      to: user.email,
      subject: 'Update on your Eventure Organizer Application',
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0a0a0f; color: #f8fafc;">
          <h2 style="color: #8b5cf6; text-align: center; font-size: 24px; margin-bottom: 20px;">Application Update</h2>
          <p style="font-size: 16px; color: #cbd5e1;">Hi ${user.name},</p>
          <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">
            Thank you for your interest in becoming an organizer on Eventure. After reviewing your application, 
            we are unable to approve it at this time.
          </p>
          <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">
            You are welcome to reapply in the future. If you have any questions, please contact our support team.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${clientUrl}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Back to Eventure</a>
          </div>
          <hr style="border: none; border-top: 1px solid #1e293b; margin: 25px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">Thank you for being part of the Eventure community.</p>
        </div>
      `
    });

    res.json({ message: 'Organizer rejected successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

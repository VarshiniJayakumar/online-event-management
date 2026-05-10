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

    res.json({ message: 'Organizer rejected successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

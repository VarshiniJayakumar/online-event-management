const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const jwt = require('jsonwebtoken');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Shared auth middleware
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

// Lazily create Razorpay instance so env vars are read at request time,
// not at module load time (important for Render cold starts / env var injection)
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// GET /api/payment/status — debug endpoint to verify keys are loaded
router.get('/status', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  res.json({
    razorpay_configured: !!(keyId && keySecret),
    key_id_present: !!keyId,
    key_id_prefix: keyId ? keyId.substring(0, 8) + '...' : null,
    key_secret_present: !!keySecret,
    mode: keyId && keyId.startsWith('rzp_live') ? 'live' : keyId ? 'test' : 'not configured'
  });
});

// Helper: send booking confirmation email
const sendBookingEmail = async ({ userId, event, quantity, ticketType, totalAmount }) => {
  try {
    const userData = await User.findById(userId);
    if (!userData) return;

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
                <td style="padding: 6px 0;">${ticketType}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Quantity:</td>
                <td style="padding: 6px 0;">${quantity}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Amount Paid:</td>
                <td style="padding: 6px 0;">₹${totalAmount}</td>
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
  } catch (emailErr) {
    console.error('Failed to send booking confirmation email:', emailErr);
  }
};

// POST /api/payment/create-order — no auth required, just creates a Razorpay order
router.post('/create-order', async (req, res) => {
  const { eventId, ticketQuantity } = req.body;

  if (!eventId || !ticketQuantity || ticketQuantity < 1) {
    return res.status(400).json({ message: 'eventId and ticketQuantity are required' });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const eventPrice = event.price || (event.tickets && event.tickets.length > 0 ? event.tickets[0].price : 0);
  // Amount in paise (INR smallest unit)
  const amount = Math.round(eventPrice * ticketQuantity * 100);

  const razorpay = getRazorpay();
  console.log('[Razorpay] Instance created:', !!razorpay, '| KEY_ID:', process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 12) + '...' : 'MISSING');

  if (!razorpay) {
    // Demo mode — no real Razorpay keys configured
    return res.json({
      id: 'demo_order_' + Date.now(),
      isDemo: true,
      amount,
      currency: 'INR',
      message: 'Demo Mode: Simulating Razorpay checkout...'
    });
  }

  try {
    const options = {
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-6)}_${eventId.toString().slice(-6)}`,
      notes: {
        eventId: eventId.toString(),
        ticketQuantity: ticketQuantity.toString()
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('[Razorpay] Order created successfully:', order.id);
    res.json({ id: order.id, amount: order.amount, currency: order.currency, isDemo: false });
  } catch (error) {
    console.error('[Razorpay] Order creation FAILED:', error.error || error.message || error);
    // Return the actual error instead of silently falling back to demo
    return res.status(500).json({
      message: 'Razorpay order creation failed: ' + (error.error?.description || error.message || 'Unknown error'),
      isDemo: false
    });
  }
});

// POST /api/payment/verify-payment
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      ticketQuantity,
      isDemo
    } = req.body;

    const userId = req.user.id;
    const quantity = parseInt(ticketQuantity, 10) || 1;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventPrice = event.price || (event.tickets && event.tickets.length > 0 ? event.tickets[0].price : 0);
    const totalAmount = eventPrice * quantity;
    const ticketType = 'General Admission';

    // ── Demo / fallback path ──────────────────────────────────────────────────
    if (isDemo || (razorpay_order_id && razorpay_order_id.startsWith('demo_order_'))) {
      const registration = new Registration({
        user: userId,
        event: eventId,
        ticketType,
        quantity,
        totalAmount,
        paymentStatus: 'completed',
        razorpayOrderId: razorpay_order_id
      });
      await registration.save();

      // Update sold count
      if (event.tickets && event.tickets.length > 0) {
        event.tickets[0].sold += quantity;
        await event.save();
      }

      await sendBookingEmail({ userId, event, quantity, ticketType, totalAmount });

      return res.status(200).json({
        message: 'Demo payment verified. Registration created.',
        registration: { status: 'completed', isDemo: true }
      });
    }

    // ── Real Razorpay signature verification ──────────────────────────────────
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(400).json({ message: 'Razorpay is not configured on the server.' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing Razorpay payment fields.' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed: Invalid signature.' });
    }

    // Prevent duplicate registrations for the same order
    const existingReg = await Registration.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingReg) {
      return res.json({ message: 'Registration already processed.', registration: existingReg });
    }

    const registration = new Registration({
      user: userId,
      event: eventId,
      ticketType,
      quantity,
      totalAmount,
      paymentStatus: 'completed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });
    await registration.save();

    // Update sold count
    if (event.tickets && event.tickets.length > 0) {
      event.tickets[0].sold += quantity;
      await event.save();
    }

    await sendBookingEmail({ userId, event, quantity, ticketType, totalAmount });

    res.status(200).json({ message: 'Payment verified. Registration created.', registration });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const jwt = require('jsonwebtoken');

const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    }) 
  : null;

router.post('/create-order', async (req, res) => {
  if (!razorpay) {
    // Demo Mode fallback
    return res.json({ 
      id: 'demo_order_' + Date.now(), 
      isDemo: true, 
      amount: req.body.ticketQuantity * 100,
      currency: "USD",
      message: 'Demo Mode: Simulating checkout...' 
    });
  }

  try {
    const { eventId, ticketQuantity } = req.body;
    
    // Fetch the real event from the database
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const amount = (event.price || 0) * ticketQuantity * 100; // Razorpay expects amount in smallest currency unit

    const options = {
      amount,
      currency: "INR", // Most Razorpay test accounts are defaulted to INR
      receipt: `rcpt_${Date.now().toString().slice(-6)}_${eventId.toString().slice(-6)}`,
      notes: {
        eventId,
        ticketQuantity: ticketQuantity.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({ id: order.id, amount: order.amount, currency: order.currency, isDemo: false });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return res.json({ 
      id: 'demo_order_' + Date.now(), 
      isDemo: true, 
      amount: req.body.ticketQuantity * 100,
      currency: "USD",
      message: 'Demo Mode (Fallback): Simulating checkout due to API issues...' 
    });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, ticketQuantity, isDemo } = req.body;
    
    // Auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = decoded.id;

    // Handle Demo Sessions
    if (isDemo || razorpay_order_id.startsWith('demo_order_')) {
      const event = await Event.findById(eventId);
      
      const registration = new Registration({
        user: userId,
        event: eventId,
        ticketType: 'General Admission',
        quantity: ticketQuantity,
        totalAmount: (event.price || 0) * ticketQuantity,
        paymentStatus: 'completed',
        razorpayOrderId: razorpay_order_id
      });
      await registration.save();
      
      if (event && event.tickets && event.tickets.length > 0) {
        event.tickets[0].sold += parseInt(ticketQuantity, 10);
        await event.save();
      }

      return res.status(200).json({ 
        message: 'Demo session verified', 
        registration: { status: 'completed', isDemo: true } 
      });
    }

    if (!razorpay) {
      return res.status(400).json({ message: 'Razorpay not configured' });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Check if registration already exists for this order to prevent duplicates
      const existingReg = await Registration.findOne({ razorpayOrderId: razorpay_order_id });
      if (existingReg) {
        return res.json({ message: 'Registration already processed', registration: existingReg });
      }

      const event = await Event.findById(eventId);
      const quantity = parseInt(ticketQuantity, 10);
      
      const registration = new Registration({
        user: userId,
        event: eventId,
        ticketType: 'General Admission',
        quantity: quantity,
        totalAmount: (event.price || 0) * quantity,
        paymentStatus: 'completed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });

      await registration.save();
      
      // Update event sold count
      if (event && event.tickets && event.tickets.length > 0) {
        event.tickets[0].sold += quantity;
        await event.save();
      }

      res.status(200).json({ message: 'Payment successful, registration created', registration });
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

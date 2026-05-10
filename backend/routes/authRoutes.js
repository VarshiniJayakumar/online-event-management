const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Helper to create JWT
const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Auto-verify if Brevo is not configured (for easier testing/demo)
    const isVerified = !process.env.BREVO_API_KEY;
    
    // Create verification token
    const verificationToken = isVerified ? undefined : crypto.randomBytes(32).toString('hex');
    
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'user',
      isVerified,
      verificationToken
    });

    if (isVerified) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      return res.status(201).json({ 
        user: { id: user._id, name: user.name, email: user.email, role: user.role }, 
        token,
        message: 'Account created and auto-verified (Brevo not configured)'
      });
    }

    // Send Verification Email
    const baseUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const verificationLink = `${baseUrl}/verify-email/${verificationToken}`;
    
    console.log(`\nVerification attempt for: ${email}`);
    console.log(`Token: ${verificationToken}\n`);

    const emailResult = await sendEmail({
      to: email,
      subject: "Verify your Eventure Account",
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ec4899; text-align: center;">Welcome to Eventure!</h2>
          <p>Hi ${name},</p>
          <p>Thanks for signing up. Please click the button below to verify your email address and activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #ec4899; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">If you did not create an account, no further action is required.</p>
        </div>
      `
    });

    if (!emailResult.success && !emailResult.simulated) {
      return res.status(201).json({ 
        message: 'Registration successful, but there was an error sending the verification email. You can try resending it from the login page.',
        requiresVerification: true,
        emailError: emailResult.error
      });
    }

    res.status(201).json({ 
      message: 'Registration successful! Please check your email to verify your account.',
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Something went wrong during registration' });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log(`\nAttempting to verify token: ${token}`);
    
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      console.log('❌ No user found with this verification token.');
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    console.log(`✅ User found: ${user.email}. Marking as verified.`);
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    res.status(200).json({ message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    // Create new token if it doesn't exist
    if (!user.verificationToken) {
      user.verificationToken = crypto.randomBytes(32).toString('hex');
      await user.save();
    }

    const baseUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const verificationLink = `${baseUrl}/verify-email/${user.verificationToken}`;

    console.log(`\nResending verification to: ${email}`);
    console.log(`Token: ${user.verificationToken}\n`);

    const emailResult = await sendEmail({
      to: email,
      subject: "Verify your Eventure Account (Resend)",
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ec4899; text-align: center;">Verify your Account</h2>
          <p>Hi ${user.name},</p>
          <p>You requested to resend your verification email. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #ec4899; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `
    });

    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send email. ' + (emailResult.error || '') });
    }

    res.status(200).json({ message: 'Verification email resent! Please check your inbox.' });
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if verified
    if (!user.isVerified && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        message: 'Please verify your email address before logging in.',
        notVerified: true
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid password' });

    const token = createToken(user);
    res.status(200).json({ 
      user: { id: user._id, name: user.name, email: user.email, role: user.role }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong during login' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with that email does not exist' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: "Reset your Eventure Password",
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ec4899;">Password Reset Request</h2>
          <p>You requested a password reset. Click the button below to choose a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ec4899; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in 15 minutes.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
});

// Profile & Account Management
router.put('/profile', async (req, res) => {
  try {
    const { name } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    await user.save();

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const user = await User.findByIdAndDelete(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Auto-upgrade role to Organizer (for demo/development purposes)
router.post('/upgrade-role', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = 'organizer';
    await user.save();

    const newToken = createToken(user);

    res.status(200).json({ 
      message: 'Role upgraded to organizer successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: newToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

const app = express();

// Configure CORS for production
// Allow all origins for now to prevent "Failed to Fetch" issues during initial setup
// You can restrict this to your Netlify URL later for better security
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

app.get('/', (req, res) => {
  res.send('Event Management API is Running');
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const eventCount = await Event.countDocuments();
    res.json({ 
      status: 'ok', 
      database: mongoose.connection.name,
      events: eventCount,
      message: 'Backend is connected to MongoDB'
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: err.message,
      error_detail: err.name
    });
  }
});

// Port handling for Render
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('CRITICAL ERROR: MONGO_URI is not defined in environment variables!');
}

mongoose.connect(MONGO_URI || 'mongodb://127.0.0.1:27017/event-management')
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server is live on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error. Please check your Atlas Whitelist or MONGO_URI:');
    console.error(err);
  });

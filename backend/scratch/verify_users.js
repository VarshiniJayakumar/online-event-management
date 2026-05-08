const crypto = require('crypto');
global.crypto = crypto;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function verifyAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const result = await User.updateMany({}, { isVerified: true });
    console.log(`Updated ${result.modifiedCount} users to verified status.`);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

verifyAllUsers();

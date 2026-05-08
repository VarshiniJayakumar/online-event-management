const crypto = require('crypto');
global.crypto = crypto;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find({}, 'name email isVerified role');
    console.log('Users in database:');
    console.table(users.map(u => ({
      name: u.name,
      email: u.email,
      isVerified: u.isVerified,
      role: u.role
    })));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

listUsers();

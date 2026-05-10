const crypto = require('crypto');
global.crypto = crypto;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');

    // Create correct hash
    const hashedPassword = await bcrypt.hash('password123', 12);

    const updatedAdmin = await User.findOneAndUpdate(
      { email: 'admin@eventure.com' },
      { 
        password: hashedPassword,
        name: 'Eventure Admin',
        role: 'admin',
        isVerified: true
      },
      { upsert: true, new: true }
    );

    console.log('Admin password successfully reset to password123');
    console.log('Admin Role:', updatedAdmin.role);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetAdmin();

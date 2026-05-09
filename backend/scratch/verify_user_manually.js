const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const emailToVerify = process.argv[2];

if (!emailToVerify) {
  console.error('Please provide an email address: node verify_user_manually.js user@example.com');
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not found in .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: emailToVerify });

    if (!user) {
      console.error(`User with email ${emailToVerify} not found.`);
      process.exit(1);
    }

    if (user.isVerified) {
      console.log(`User ${emailToVerify} is already verified.`);
    } else {
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
      console.log(`Successfully verified user: ${emailToVerify}`);
    }

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Connection error:', err);
  });

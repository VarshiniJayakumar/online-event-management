const crypto = require('crypto');
global.crypto = crypto;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Registration = require('./models/Registration');

dotenv.config();

const resetUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Delete all registrations to prevent orphan data
    await Registration.deleteMany({});
    console.log('Cleared all event registrations.');

    // Delete all users EXCEPT the default admin/organizer
    const result = await User.deleteMany({ email: { $ne: 'admin@eventure.com' } });
    console.log(`Successfully deleted ${result.deletedCount} user accounts.`);
    
    console.log('Database reset complete. You can now register your email again!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting data:', error);
    process.exit(1);
  }
};

resetUsers();

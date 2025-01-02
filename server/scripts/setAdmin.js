const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const setAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return;
    }

    user.isAdmin = true;
    await user.save();
    console.log(`User ${email} is now an admin`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
};

// Usage: node setAdmin.js your@email.com
const email = process.argv[2];
if (email) {
  setAdmin(email);
} else {
  console.log('Please provide an email address');
} 
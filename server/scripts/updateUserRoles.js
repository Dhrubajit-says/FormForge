const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function updateUserRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Update all users without a role to have 'user' role
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );

    console.log(`Updated ${result.modifiedCount} users with default role`);

    // Verify all users now
    const users = await User.find().select('username email role');
    users.forEach(user => {
      console.log(`User ${user.username} has role: ${user.role}`);
    });

    console.log('Finished updating user roles');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateUserRoles(); 
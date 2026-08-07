/**
 * Seeds a demo admin account and a demo user account.
 * Usage: node seed/seedUsers.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected: ${mongoose.connection.host}`);

    const adminExists = await User.findOne({ email: 'admin@smartparking.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@smartparking.com',
        password: 'admin123',
        role: 'admin',
        phone: '9999999999',
      });
      console.log('✅ Admin created: admin@smartparking.com / admin123');
    } else {
      console.log('Admin already exists, skipping.');
    }

    const userExists = await User.findOne({ email: 'user@smartparking.com' });
    if (!userExists) {
      await User.create({
        name: 'Demo User',
        email: 'user@smartparking.com',
        password: 'user1234',
        role: 'user',
        phone: '8888888888',
      });
      console.log('✅ Demo user created: user@smartparking.com / user1234');
    } else {
      console.log('Demo user already exists, skipping.');
    }
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();

/**
 * Promote an existing user to the 'admin' role.
 * Usage: node seed/makeAdmin.js user@example.com
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];

const run = async () => {
  if (!email) {
    console.error('Usage: node seed/makeAdmin.js <email>');
    process.exitCode = 1;
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exitCode = 1;
      return;
    }
    console.log(`✅ ${user.email} is now an admin.`);
  } catch (error) {
    console.error('Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();

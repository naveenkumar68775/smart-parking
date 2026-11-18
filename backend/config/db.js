const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_parking';
    mongoUri = mongoUri.trim();

    // Determine dbName fallback if URI ends with / or has no database name specified
    const uriWithoutProtocol = mongoUri.replace(/^mongodb(\+srv)?:\/\/[^/]+/, '');
    const cleanPath = uriWithoutProtocol.replace(/^\//, '').split('?')[0];
    const connectOptions = {};
    if (!cleanPath) {
      connectOptions.dbName = 'smart_parking';
    }

    const conn = await mongoose.connect(mongoUri, connectOptions);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed initial parking slots if database is currently empty
    const Slot = require('../models/Slot');
    const totalSlots = await Slot.countDocuments();
    if (totalSlots === 0) {
      const floorConfigs = [
        { name: 'Basement 1', prefix: 'B1', count: 10, defaultRate: 20 },
        { name: 'Ground Floor', prefix: 'GF', count: 15, defaultRate: 25 },
        { name: 'First Floor', prefix: '1F', count: 15, defaultRate: 20 },
        { name: 'Second Floor', prefix: '2F', count: 10, defaultRate: 18 },
        { name: 'Third Floor', prefix: '3F', count: 10, defaultRate: 15 },
        { name: 'VIP Plaza', prefix: 'VIP', count: 8, defaultRate: 60 },
      ];
      const types = ['Car', 'Bike', 'EV', 'VIP'];
      const toCreate = [];
      floorConfigs.forEach((cfg) => {
        for (let i = 1; i <= cfg.count; i++) {
          const vehicleType = cfg.prefix === 'VIP' ? (i <= 4 ? 'VIP' : 'EV') : types[(i - 1) % 4];
          let rate = cfg.defaultRate;
          if (vehicleType === 'VIP') rate = 60;
          else if (vehicleType === 'EV') rate = 35;
          else if (vehicleType === 'Bike') rate = 15;

          toCreate.push({
            slotNumber: `${cfg.prefix}-${i.toString().padStart(2, '0')}`,
            floor: cfg.name,
            section: String.fromCharCode(65 + (i % 3)),
            vehicleType,
            hourlyRate: rate,
            status: 'Available',
          });
        }
      });
      await Slot.insertMany(toCreate);
      console.log(`[MongoDB] Auto-seeded ${toCreate.length} initial parking slots across 6 floors!`);
    }

    // Auto-seed demo users if none exist
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create([
        {
          name: 'Admin User',
          email: 'admin@smartparking.com',
          password: 'admin123',
          role: 'admin',
          phone: '9999999999',
        },
        {
          name: 'Demo User',
          email: 'user@smartparking.com',
          password: 'user1234',
          role: 'user',
          phone: '8888888888',
        },
      ]);
      console.log('[MongoDB] Auto-seeded demo accounts: admin@smartparking.com / admin123 & user@smartparking.com / user1234');
    }
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('👉 Hint: Local MongoDB service is not running. Please start MongoDB service or use MongoDB Atlas URI.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('👉 Hint: Check your MongoDB Atlas hostname in backend/.env.');
    } else if (error.message.includes('Authentication failed')) {
      console.error('👉 Hint: Check your MongoDB Atlas username and password in backend/.env.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;

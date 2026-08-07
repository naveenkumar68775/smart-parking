/**
 * Standalone seeder: populates a mixed demo set of parking slots.
 * Usage: npm run seed   (from backend/)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Slot = require('../models/Slot');

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in backend/.env');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);

    // Clear existing slots for clean seeding
    await Slot.deleteMany({});
    console.log('Cleared existing slots.');

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

    const slots = await Slot.insertMany(toCreate);
    console.log(`Successfully seeded ${slots.length} parking slots across 6 floors!`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();

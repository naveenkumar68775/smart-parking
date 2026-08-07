/**
 * Standalone script to add CAR parking slots directly (no server/token needed).
 * Usage:
 *   node seed/addCarSlots.js
 *   node seed/addCarSlots.js --count=15 --floor=Ground --section=A --prefix=C --rate=20
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Slot = require('../models/Slot');

const args = process.argv.slice(2).reduce((acc, arg) => {
  const match = arg.match(/^--([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const COUNT = parseInt(args.count, 10) || 20;
const FLOOR = args.floor || 'Ground';
const SECTION = args.section || 'A';
const PREFIX = args.prefix || 'C';
const RATE = parseInt(args.rate, 10) || Number(process.env.DEFAULT_HOURLY_RATE) || 20;

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected: ${mongoose.connection.host}`);

    const existing = await Slot.find({ slotNumber: new RegExp(`^${PREFIX}-\\d+$`) });
    const existingNumbers = new Set(existing.map((s) => s.slotNumber));
    let highest = existing.reduce((max, s) => {
      const n = parseInt(s.slotNumber.split('-')[1], 10);
      return n > max ? n : max;
    }, 0);

    const toCreate = [];
    let added = 0;
    let next = highest + 1;
    while (added < COUNT) {
      const slotNumber = `${PREFIX}-${String(next).padStart(2, '0')}`;
      if (!existingNumbers.has(slotNumber)) {
        toCreate.push({ slotNumber, floor: FLOOR, section: SECTION, vehicleType: 'Car', hourlyRate: RATE, status: 'Available' });
        added++;
      }
      next++;
    }

    const created = await Slot.insertMany(toCreate);
    console.log(`✅ Added ${created.length} car parking slots:`);
    created.forEach((s) => console.log(`   - ${s.slotNumber} (${s.floor}/${s.section})`));
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();

const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    slotNumber: { type: String, required: true, unique: true, trim: true },
    floor: { type: String, default: 'Ground' },
    section: { type: String, default: 'A' },
    vehicleType: { type: String, enum: ['Car', 'Bike', 'EV', 'VIP'], default: 'Car' },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'],
      default: 'Available',
    },
    hourlyRate: { type: Number, default: 20 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slot', slotSchema);

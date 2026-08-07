const mongoose = require('mongoose');

// Dedicated audit-log collection for every completed parking session
// (separate from Booking so historical records persist independent of booking lifecycle changes)
const parkingHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    vehicleNumber: { type: String, required: true },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
  },
  { timestamps: true }
);

parkingHistorySchema.index({ user: 1, exitTime: -1 });

module.exports = mongoose.model('ParkingHistory', parkingHistorySchema);

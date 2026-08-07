const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },

    bookingDate: { type: Date, default: Date.now },
    entryTime: { type: Date, default: null },
    expectedExitTime: { type: Date, required: true },
    actualExitTime: { type: Date, default: null },
    duration: { type: Number, default: null }, // minutes, filled on exit

    amount: { type: Number, required: true }, // estimated at booking time
    finalAmount: { type: Number, default: null }, // computed at exit

    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },

    qrCode: { type: String }, // base64 data URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);

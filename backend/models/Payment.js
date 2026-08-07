const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash'], default: 'Card' },
    paymentStatus: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Pending' },
    transactionId: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, required: true, unique: true },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

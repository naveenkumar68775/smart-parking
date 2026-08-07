const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { buildInvoiceHtml } = require('../utils/invoiceGenerator');
const { emitNotification } = require('../config/socket');

// @route POST /api/payments - pay for a booking (mock gateway)
exports.createPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId).populate('slot');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Booking already paid' });
    }

    const amount = booking.finalAmount ?? booking.amount;
    const transactionId = 'TXN-' + uuidv4();
    const invoiceNumber = 'INV-' + Date.now();

    // --- mock gateway: succeeds whenever amount is valid ---
    const success = amount > 0;

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount,
      paymentMethod: paymentMethod || 'Card',
      paymentStatus: success ? 'Success' : 'Failed',
      transactionId,
      invoiceNumber,
    });

    if (success) {
      booking.paymentStatus = 'Paid';
      await booking.save();

      const notification = await Notification.create({
        user: req.user._id,
        title: 'Payment Success',
        message: `Payment of ₹${amount} received for booking ${booking.bookingId}.`,
        type: 'PaymentSuccess',
      });
      emitNotification(req.user._id.toString(), notification);
    }

    res.status(success ? 201 : 400).json({ success, payment });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/payments/my
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({ path: 'booking', populate: 'slot' })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/payments (admin) - all payments / revenue reports
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate({ path: 'booking', populate: 'slot' })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/payments/:id/invoice - HTML invoice (printable to PDF from the browser)
exports.getInvoice = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user')
      .populate({ path: 'booking', populate: 'slot' });

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const html = buildInvoiceHtml({
      invoiceNumber: payment.invoiceNumber,
      user: payment.user,
      booking: payment.booking,
      payment,
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    next(error);
  }
};

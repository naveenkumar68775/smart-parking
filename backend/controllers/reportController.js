const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @route GET /api/reports/search?query=...&type=vehicle|booking|slot|user
exports.search = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'query is required' });

    const regex = new RegExp(query, 'i');
    const bookings = await Booking.find({ bookingId: regex })
      .populate('slot')
      .populate('vehicle')
      .populate('user', 'name email')
      .limit(20);

    const vehicleMatches = await Booking.find()
      .populate({ path: 'vehicle', match: { vehicleNumber: regex } })
      .populate('slot')
      .populate('user', 'name email')
      .limit(50);
    const filteredVehicleMatches = vehicleMatches.filter((b) => b.vehicle);

    const slotMatches = await Booking.find()
      .populate({ path: 'slot', match: { slotNumber: regex } })
      .populate('vehicle')
      .populate('user', 'name email')
      .limit(50);
    const filteredSlotMatches = slotMatches.filter((b) => b.slot);

    const userMatches = await Booking.find()
      .populate({ path: 'user', match: { name: regex }, select: 'name email' })
      .populate('slot')
      .populate('vehicle')
      .limit(50);
    const filteredUserMatches = userMatches.filter((b) => b.user);

    // Merge + de-duplicate by booking _id
    const merged = new Map();
    [...bookings, ...filteredVehicleMatches, ...filteredSlotMatches, ...filteredUserMatches].forEach((b) => {
      merged.set(b._id.toString(), b);
    });

    res.json({ success: true, results: Array.from(merged.values()) });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/reports/bookings/filter?vehicleType=&status=&date=&floor=&section=
exports.filterBookings = async (req, res, next) => {
  try {
    const { status, date, vehicleType, floor, section } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    let bookings = await Booking.find(filter).populate('slot').populate('vehicle').populate('user', 'name email');

    if (vehicleType) bookings = bookings.filter((b) => b.vehicle?.vehicleType === vehicleType);
    if (floor) bookings = bookings.filter((b) => b.slot?.floor === floor);
    if (section) bookings = bookings.filter((b) => b.slot?.section === section);

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// Helper: convert an array of flat objects to CSV text
const toCsv = (rows) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  });
  return lines.join('\n');
};

// @route GET /api/reports/bookings/export?format=csv
exports.exportBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('slot').populate('vehicle').populate('user', 'name email');

    const rows = bookings.map((b) => ({
      bookingId: b.bookingId,
      user: b.user?.name,
      email: b.user?.email,
      vehicleNumber: b.vehicle?.vehicleNumber,
      slotNumber: b.slot?.slotNumber,
      status: b.status,
      paymentStatus: b.paymentStatus,
      amount: b.finalAmount ?? b.amount,
      bookingDate: b.bookingDate?.toISOString(),
      entryTime: b.entryTime?.toISOString() || '',
      actualExitTime: b.actualExitTime?.toISOString() || '',
    }));

    const format = req.query.format || 'csv';
    if (format === 'json') {
      return res.json({ success: true, rows });
    }

    const csv = toCsv(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings-report.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/reports/payments/export?format=csv
exports.exportPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().populate('user', 'name email').populate('booking');

    const rows = payments.map((p) => ({
      invoiceNumber: p.invoiceNumber,
      transactionId: p.transactionId,
      user: p.user?.name,
      email: p.user?.email,
      bookingId: p.booking?.bookingId,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      paymentStatus: p.paymentStatus,
      paymentDate: p.paymentDate?.toISOString(),
    }));

    const format = req.query.format || 'csv';
    if (format === 'json') {
      return res.json({ success: true, rows });
    }

    const csv = toCsv(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payments-report.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

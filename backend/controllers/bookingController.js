const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');
const generateQRCode = require('../utils/qrGenerator');
const { emitParkingUpdate, emitNotification } = require('../config/socket');

const calcHours = (start, end) => Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));

// @route POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { slotId, vehicleId, expectedExitTime } = req.body;

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (slot.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Slot is not available' });
    }

    const vehicle = await Vehicle.findOne({ _id: vehicleId, user: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const exit = new Date(expectedExitTime);
    const now = new Date();
    if (exit <= now) {
      return res.status(400).json({ success: false, message: 'expectedExitTime must be in the future' });
    }

    const hours = calcHours(now, exit);
    const amount = hours * slot.hourlyRate;
    const bookingId = 'BK-' + uuidv4().split('-')[0].toUpperCase();

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      vehicle: vehicle._id,
      slot: slot._id,
      expectedExitTime: exit,
      amount,
      status: 'Confirmed',
    });

    const qrPayload = {
      bookingId: booking.bookingId,
      userId: req.user._id.toString(),
      slotNumber: slot.slotNumber,
      vehicleNumber: vehicle.vehicleNumber,
      expectedExitTime: exit,
    };
    booking.qrCode = await generateQRCode(qrPayload);
    await booking.save();

    slot.status = 'Reserved';
    await slot.save();

    const notification = await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed',
      message: `Your booking ${booking.bookingId} for slot ${slot.slotNumber} is confirmed.`,
      type: 'BookingConfirmed',
    });
    emitNotification(req.user._id.toString(), notification);
    emitParkingUpdate({ type: 'slot_updated', slot });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('slot')
      .populate('vehicle')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/bookings (admin) - all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const bookings = await Booking.find(filter)
      .populate('slot')
      .populate('vehicle')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('slot').populate('vehicle');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!['Pending', 'Confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking can no longer be cancelled' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    const slot = await Slot.findByIdAndUpdate(booking.slot, { status: 'Available' }, { new: true });

    const notification = await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingId} has been cancelled.`,
      type: 'BookingCancelled',
    });
    emitNotification(booking.user.toString(), notification);
    emitParkingUpdate({ type: 'slot_updated', slot });

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/bookings/:id/extend - extend expected exit time
exports.extendBooking = async (req, res, next) => {
  try {
    const { newExpectedExitTime } = req.body;
    const booking = await Booking.findById(req.params.id).populate('slot');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!['Confirmed', 'Active'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Only active/confirmed bookings can be extended' });
    }

    const newExit = new Date(newExpectedExitTime);
    if (newExit <= new Date(booking.expectedExitTime)) {
      return res.status(400).json({ success: false, message: 'New exit time must be later than current' });
    }

    const referenceStart = booking.entryTime || booking.bookingDate;
    const hours = calcHours(referenceStart, newExit);
    booking.expectedExitTime = newExit;
    booking.amount = hours * booking.slot.hourlyRate;
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/bookings/:id/approve (admin)
exports.approveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.status = 'Confirmed';
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

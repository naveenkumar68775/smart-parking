const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Notification = require('../models/Notification');
const ParkingHistory = require('../models/ParkingHistory');
const { emitParkingUpdate, emitNotification } = require('../config/socket');

const parseQrData = (qrData) => {
  try {
    return JSON.parse(qrData);
  } catch {
    return { bookingId: qrData };
  }
};

// @route POST /api/qr/scan-entry (admin)
exports.scanEntry = async (req, res, next) => {
  try {
    const { qrData } = req.body;
    if (!qrData) return res.status(400).json({ success: false, message: 'qrData is required' });

    const { bookingId } = parseQrData(qrData);
    const booking = await Booking.findOne({ bookingId }).populate('slot');
    if (!booking) return res.status(404).json({ success: false, message: 'Invalid QR / booking not found' });
    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ success: false, message: `Booking status is '${booking.status}', cannot check in` });
    }
    if (booking.paymentStatus !== 'Paid') {
      return res.status(400).json({ success: false, message: 'Payment pending. Please pay before entry.' });
    }

    booking.entryTime = new Date();
    booking.status = 'Active';
    await booking.save();

    const slot = await Slot.findByIdAndUpdate(booking.slot._id, { status: 'Occupied' }, { new: true });
    emitParkingUpdate({ type: 'slot_updated', slot });

    res.json({ success: true, message: 'Entry approved. Gate opening.', booking });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/qr/scan-exit (admin)
exports.scanExit = async (req, res, next) => {
  try {
    const { qrData } = req.body;
    if (!qrData) return res.status(400).json({ success: false, message: 'qrData is required' });

    const { bookingId } = parseQrData(qrData);
    const booking = await Booking.findOne({ bookingId }).populate('slot');
    if (!booking) return res.status(404).json({ success: false, message: 'Invalid QR / booking not found' });
    if (booking.status !== 'Active') {
      return res.status(400).json({ success: false, message: `Booking is not active (status: '${booking.status}')` });
    }

    const exitTime = new Date();
    const durationMinutes = Math.max(1, Math.round((exitTime - booking.entryTime) / 60000));
    const hours = Math.max(1, Math.ceil(durationMinutes / 60));
    const finalAmount = hours * booking.slot.hourlyRate;

    booking.actualExitTime = exitTime;
    booking.duration = durationMinutes;
    booking.finalAmount = finalAmount;
    booking.status = 'Completed';
    if (finalAmount > booking.amount) booking.paymentStatus = 'Pending'; // extra due
    await booking.save();

    const slot = await Slot.findByIdAndUpdate(booking.slot._id, { status: 'Available' }, { new: true });
    emitParkingUpdate({ type: 'slot_updated', slot });

    await ParkingHistory.create({
      user: booking.user,
      booking: booking._id,
      slot: booking.slot._id,
      vehicleNumber: (await booking.populate('vehicle')).vehicle?.vehicleNumber || 'N/A',
      entryTime: booking.entryTime,
      exitTime,
      durationMinutes,
      amountPaid: Math.min(finalAmount, booking.amount) || finalAmount,
    });

    const notification = await Notification.create({
      user: booking.user,
      title: 'Parking Completed',
      message: `Exit recorded for booking ${booking.bookingId}. Total: ₹${finalAmount}.`,
      type: 'General',
    });
    emitNotification(booking.user.toString(), notification);

    res.json({
      success: true,
      message: finalAmount > booking.amount ? 'Exit approved. Additional payment required.' : 'Exit approved. Gate opening.',
      booking,
      durationMinutes,
      finalAmount,
    });
  } catch (error) {
    next(error);
  }
};

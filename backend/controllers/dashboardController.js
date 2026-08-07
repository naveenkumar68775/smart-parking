const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Payment = require('../models/Payment');

// @route GET /api/dashboard/admin
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalSlots, availableSlots, occupiedSlots, registeredUsers, completedParking, todaysBookings] =
      await Promise.all([
        Slot.countDocuments(),
        Slot.countDocuments({ status: 'Available' }),
        Slot.countDocuments({ status: 'Occupied' }),
        User.countDocuments({ role: 'user' }),
        Booking.countDocuments({ status: 'Completed' }),
        Booking.countDocuments({ createdAt: { $gte: todayStart } }),
      ]);

    const todaysRevenueAgg = await Payment.aggregate([
      { $match: { createdAt: { $gte: todayStart }, paymentStatus: 'Success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Monthly revenue - last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, paymentStatus: 'Success' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const vehicleDistribution = await Vehicle.aggregate([
      { $group: { _id: '$vehicleType', count: { $sum: 1 } } },
    ]);

    const peakHours = await Booking.aggregate([
      { $match: { entryTime: { $ne: null } } },
      { $group: { _id: { $hour: '$entryTime' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      cards: {
        todaysRevenue: todaysRevenueAgg[0]?.total || 0,
        todaysBookings,
        availableSlots,
        occupiedSlots,
        registeredUsers,
        completedParking,
        totalSlots,
      },
      charts: { monthlyRevenue, monthlyBookings, vehicleDistribution, peakHours },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/dashboard/user
exports.getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [currentBooking, completedBookingCount, savedVehicles, payments] = await Promise.all([
      Booking.findOne({ user: userId, status: { $in: ['Confirmed', 'Active'] } })
        .populate('slot')
        .populate('vehicle')
        .sort({ createdAt: -1 }),
      Booking.countDocuments({ user: userId, status: 'Completed' }),
      Vehicle.countDocuments({ user: userId }),
      Payment.find({ user: userId, paymentStatus: 'Success' }),
    ]);

    const totalPayment = payments.reduce((sum, p) => sum + p.amount, 0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySpending = await Payment.aggregate([
      { $match: { user: userId, createdAt: { $gte: sixMonthsAgo }, paymentStatus: 'Success' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const bookingHistory = await Booking.find({ user: userId })
      .populate('slot')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      cards: {
        currentBooking,
        completedBooking: completedBookingCount,
        totalPayment,
        savedVehicles,
      },
      charts: { bookingHistory, monthlySpending },
    });
  } catch (error) {
    next(error);
  }
};

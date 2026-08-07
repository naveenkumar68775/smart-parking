const ParkingHistory = require('../models/ParkingHistory');

// @route GET /api/history/my
exports.getMyHistory = async (req, res, next) => {
  try {
    const history = await ParkingHistory.find({ user: req.user._id }).populate('slot').sort({ exitTime: -1 });
    res.json({ success: true, count: history.length, history });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/history (admin)
exports.getAllHistory = async (req, res, next) => {
  try {
    const history = await ParkingHistory.find()
      .populate('slot')
      .populate('user', 'name email')
      .sort({ exitTime: -1 });
    res.json({ success: true, count: history.length, history });
  } catch (error) {
    next(error);
  }
};

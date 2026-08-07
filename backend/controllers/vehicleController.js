const Vehicle = require('../models/Vehicle');

// @route GET /api/vehicles - current user's vehicles
exports.getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/vehicles
exports.addVehicle = async (req, res, next) => {
  try {
    const { vehicleNumber, vehicleName, vehicleBrand, vehicleColor, vehicleType } = req.body;
    const vehicle = await Vehicle.create({
      user: req.user._id,
      vehicleNumber,
      vehicleName,
      vehicleBrand,
      vehicleColor,
      vehicleType,
    });
    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/vehicles/:id
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, user: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    Object.assign(vehicle, req.body);
    await vehicle.save();
    res.json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, message: 'Vehicle removed' });
  } catch (error) {
    next(error);
  }
};

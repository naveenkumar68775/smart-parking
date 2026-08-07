const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const { emitParkingUpdate } = require('../config/socket');

const buildSummary = async () => {
  const slots = await Slot.find();
  const summary = {
    total: slots.length,
    available: slots.filter((s) => s.status === 'Available').length,
    occupied: slots.filter((s) => s.status === 'Occupied').length,
    reserved: slots.filter((s) => s.status === 'Reserved').length,
    maintenance: slots.filter((s) => s.status === 'Maintenance').length,
  };
  return { summary, slots };
};

// @route GET /api/slots - live parking availability (all slots)
exports.getSlots = async (req, res, next) => {
  try {
    const { summary, slots } = await buildSummary();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaysBookings = await Booking.countDocuments({ createdAt: { $gte: todayStart } });
    const todaysRevenueAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: todayStart }, paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$finalAmount', '$amount'] } } } },
    ]);

    res.json({
      success: true,
      summary,
      todaysBookings,
      todaysRevenue: todaysRevenueAgg[0]?.total || 0,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/slots/available
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const filter = { status: 'Available' };
    if (req.query.vehicleType) filter.vehicleType = req.query.vehicleType;
    if (req.query.floor) filter.floor = req.query.floor;
    if (req.query.section) filter.section = req.query.section;

    const slots = await Slot.find(filter).sort({ slotNumber: 1 });
    res.json({ success: true, count: slots.length, slots });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/slots (admin)
exports.createSlot = async (req, res, next) => {
  try {
    const { slotNumber, floor, section, vehicleType, hourlyRate } = req.body;
    const slot = await Slot.create({
      slotNumber,
      floor,
      section,
      vehicleType,
      hourlyRate: hourlyRate || process.env.DEFAULT_HOURLY_RATE || 20,
    });
    emitParkingUpdate({ type: 'slot_created', slot });
    res.status(201).json({ success: true, slot });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/slots/:id (admin) - update / enable / disable
exports.updateSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    emitParkingUpdate({ type: 'slot_updated', slot });
    res.json({ success: true, slot });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/slots/:id (admin)
exports.deleteSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    emitParkingUpdate({ type: 'slot_deleted', slotId: req.params.id });
    res.json({ success: true, message: 'Slot removed' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/slots/add-cars (admin) - bulk add car slots
exports.addCarSlots = async (req, res, next) => {
  try {
    const count = Number(req.body.count) > 0 ? Number(req.body.count) : 20;
    const floor = req.body.floor || 'Ground';
    const section = req.body.section || 'A';
    const prefix = req.body.prefix || 'C';
    const hourlyRate = req.body.hourlyRate || process.env.DEFAULT_HOURLY_RATE || 20;

    const existing = await Slot.find({ slotNumber: new RegExp(`^${prefix}-\\d+$`) });
    const existingNumbers = new Set(existing.map((s) => s.slotNumber));
    let highest = existing.reduce((max, s) => {
      const n = parseInt(s.slotNumber.split('-')[1], 10);
      return n > max ? n : max;
    }, 0);

    const toCreate = [];
    let added = 0;
    let next = highest + 1;
    while (added < count) {
      const slotNumber = `${prefix}-${String(next).padStart(2, '0')}`;
      if (!existingNumbers.has(slotNumber)) {
        toCreate.push({ slotNumber, floor, section, vehicleType: 'Car', hourlyRate, status: 'Available' });
        added++;
      }
      next++;
    }

    const created = await Slot.insertMany(toCreate);
    emitParkingUpdate({ type: 'slots_bulk_added', count: created.length });
    res.status(201).json({ success: true, message: `${created.length} car slots added`, slots: created });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/slots/seed (admin) - seed a mixed demo slot set
exports.seedSlots = async (req, res, next) => {
  try {
    await Slot.deleteMany({});
    const floorConfigs = [
      { name: 'Basement 1', prefix: 'B1', count: 10, defaultRate: 20 },
      { name: 'Ground Floor', prefix: 'GF', count: 15, defaultRate: 25 },
      { name: 'First Floor', prefix: '1F', count: 15, defaultRate: 20 },
      { name: 'Second Floor', prefix: '2F', count: 10, defaultRate: 18 },
      { name: 'Third Floor', prefix: '3F', count: 10, defaultRate: 15 },
      { name: 'VIP Plaza', prefix: 'VIP', count: 8, defaultRate: 60 },
    ];
    const types = ['Car', 'Bike', 'EV', 'VIP'];
    const toCreate = [];
    floorConfigs.forEach((cfg) => {
      for (let i = 1; i <= cfg.count; i++) {
        const vehicleType = cfg.prefix === 'VIP' ? (i <= 4 ? 'VIP' : 'EV') : types[(i - 1) % 4];
        let rate = cfg.defaultRate;
        if (vehicleType === 'VIP') rate = 60;
        else if (vehicleType === 'EV') rate = 35;
        else if (vehicleType === 'Bike') rate = 15;

        toCreate.push({
          slotNumber: `${cfg.prefix}-${i.toString().padStart(2, '0')}`,
          floor: cfg.name,
          section: String.fromCharCode(65 + (i % 3)),
          vehicleType,
          hourlyRate: rate,
          status: 'Available',
        });
      }
    });

    const slots = await Slot.insertMany(toCreate);
    emitParkingUpdate({ type: 'slots_seeded', count: slots.length });
    res.status(201).json({ success: true, message: `${slots.length} slots seeded across 6 floors`, slots });
  } catch (error) {
    next(error);
  }
};

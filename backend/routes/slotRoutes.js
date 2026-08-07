const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/slotController');

const router = express.Router();

router.get('/', protect, ctrl.getSlots);
router.get('/available', protect, ctrl.getAvailableSlots);
router.post('/', protect, authorize('admin'), ctrl.createSlot);
router.post('/seed', protect, authorize('admin'), ctrl.seedSlots);
router.post('/add-cars', protect, authorize('admin'), ctrl.addCarSlots);
router.put('/:id', protect, authorize('admin'), ctrl.updateSlot);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteSlot);

module.exports = router;

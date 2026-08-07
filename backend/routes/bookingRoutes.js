const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/bookingController');

const router = express.Router();

router.post('/', protect, ctrl.createBooking);
router.get('/my', protect, ctrl.getMyBookings);
router.get('/', protect, authorize('admin'), ctrl.getAllBookings);
router.get('/:id', protect, ctrl.getBookingById);
router.put('/:id/cancel', protect, ctrl.cancelBooking);
router.put('/:id/extend', protect, ctrl.extendBooking);
router.put('/:id/approve', protect, authorize('admin'), ctrl.approveBooking);

module.exports = router;

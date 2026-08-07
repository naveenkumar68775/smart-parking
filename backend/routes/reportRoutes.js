const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

const router = express.Router();

router.get('/search', protect, authorize('admin'), ctrl.search);
router.get('/bookings/filter', protect, authorize('admin'), ctrl.filterBookings);
router.get('/bookings/export', protect, authorize('admin'), ctrl.exportBookings);
router.get('/payments/export', protect, authorize('admin'), ctrl.exportPayments);

module.exports = router;

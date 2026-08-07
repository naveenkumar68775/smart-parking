const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

const router = express.Router();

router.post('/', protect, ctrl.createPayment);
router.get('/my', protect, ctrl.getMyPayments);
router.get('/', protect, authorize('admin'), ctrl.getAllPayments);
router.get('/:id/invoice', protect, ctrl.getInvoice);

module.exports = router;

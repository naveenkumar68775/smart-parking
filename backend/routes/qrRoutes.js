const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/qrController');

const router = express.Router();

router.post('/scan-entry', protect, authorize('admin'), ctrl.scanEntry);
router.post('/scan-exit', protect, authorize('admin'), ctrl.scanExit);

module.exports = router;

const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

const router = express.Router();

router.get('/admin', protect, authorize('admin'), ctrl.getAdminDashboard);
router.get('/user', protect, ctrl.getUserDashboard);

module.exports = router;

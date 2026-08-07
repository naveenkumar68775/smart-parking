const express = require('express');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, ctrl.getNotifications);
router.put('/:id/read', protect, ctrl.markAsRead);
router.put('/read-all', protect, ctrl.markAllAsRead);

module.exports = router;

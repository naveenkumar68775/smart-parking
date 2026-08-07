const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/historyController');

const router = express.Router();

router.get('/my', protect, ctrl.getMyHistory);
router.get('/', protect, authorize('admin'), ctrl.getAllHistory);

module.exports = router;

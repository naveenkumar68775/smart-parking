const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');
const ctrl = require('../controllers/userController');

const router = express.Router();

router.get('/profile', protect, ctrl.getProfile);
router.put('/profile', protect, ctrl.updateProfile);
router.put('/change-password', protect, ctrl.changePassword);
router.post('/avatar', protect, upload.single('avatar'), ctrl.uploadAvatar);

router.get('/', protect, authorize('admin'), ctrl.getAllUsers);
router.put('/:id/toggle-active', protect, authorize('admin'), ctrl.toggleUserActive);

module.exports = router;

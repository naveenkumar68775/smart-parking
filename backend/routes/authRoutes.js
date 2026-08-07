const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  ctrl.register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);

router.post(
  '/forgot-password',
  [body('email').isEmail()],
  validate,
  ctrl.forgotPassword
);

router.post(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 })],
  validate,
  ctrl.resetPassword
);

module.exports = router;

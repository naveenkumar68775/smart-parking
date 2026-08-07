const express = require('express');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/vehicleController');

const router = express.Router();

router.get('/', protect, ctrl.getVehicles);
router.post('/', protect, ctrl.addVehicle);
router.put('/:id', protect, ctrl.updateVehicle);
router.delete('/:id', protect, ctrl.deleteVehicle);

module.exports = router;

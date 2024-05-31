const express = require('express');
const { addCar, getCars, getCarById, updateCar, deleteCar, updateCarLocation, trackCar, updateCarLocationHistory, startRouteSimulation } = require('../controllers/carController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Routes for car management
router.route('/').post(protect, addCar).get(protect, getCars);
router.route('/:id').get(protect, getCarById).put(protect, updateCar).delete(protect, deleteCar);
router.patch('/:carId', updateCarLocation);
router.get('/track/:licensePlate', trackCar);
router.route('/:id/location').put(protect, updateCarLocationHistory);
router.route('/:id/simulate').post(protect, startRouteSimulation);
  // router.route('/:id/history').get(protect, getCarHistory);
  // router.route('/checkArea').post(protect, checkCarArea);



module.exports = router;

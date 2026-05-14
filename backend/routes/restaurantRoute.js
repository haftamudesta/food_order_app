const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { protect } = require('../middleware/Protect');

router.get('/search', restaurantController.searchRestaurants);

router.get('/featured', restaurantController.getFeaturedRestaurants);
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurant);
router.get('/:id/hours', restaurantController.getOperatingHours);
router.get('/:id/is-open', restaurantController.checkIsOpen);
router.get('/:id/stats', restaurantController.getRestaurantStats);

router.post('/', restaurantController.createRestaurant);
router.get('/my-restaurants',protect, restaurantController.getMyRestaurants);
router.patch('/:id', restaurantController.updateRestaurant);
router.delete('/:id', restaurantController.deleteRestaurant);
router.patch('/:id/toggle-status', restaurantController.toggleRestaurantStatus);

module.exports=router
const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { protect } = require('../middleware/Protect');

// IMPORTANT: Specific routes MUST come before parameter routes (/:id)

// Public routes - specific paths first
router.get('/search', restaurantController.searchRestaurants);
router.get('/featured', restaurantController.getFeaturedRestaurants);
router.get('/my-restaurants', protect, restaurantController.getMyRestaurants);
router.get('/', restaurantController.getAllRestaurants);

// Parameter routes (with :id) - these should come AFTER specific routes
router.get('/:id', restaurantController.getRestaurant);
router.get('/:id/hours', restaurantController.getOperatingHours);
router.get('/:id/is-open', restaurantController.checkIsOpen);
router.get('/:id/stats', restaurantController.getRestaurantStats);

// Mutation routes
router.post('/', protect, restaurantController.createRestaurant);
router.patch('/:id', protect, restaurantController.updateRestaurant);
router.delete('/:id', protect, restaurantController.deleteRestaurant);
router.patch('/:id/toggle-status', protect, restaurantController.toggleRestaurantStatus);

module.exports = router;
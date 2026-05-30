const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");
const { protect } = require("../middleware/Protect");
const { uploadMultiple } = require("../config/cloudinary");

router.get("/search", restaurantController.searchRestaurants);
router.get("/featured", restaurantController.getFeaturedRestaurants);
router.get("/", restaurantController.getAllRestaurants);

router.get("/:id/reviews/analysis", restaurantController.getReviewAnalysis);

router.get("/:id", restaurantController.getRestaurant);
router.get("/:id/hours", restaurantController.getOperatingHours);
router.get("/:id/is-open", restaurantController.checkIsOpen);
router.get("/:id/stats", restaurantController.getRestaurantStats);

// Owner/Admin routes
router.get("/my-restaurants", protect, restaurantController.getMyRestaurants);

router.post(
  "/",
  protect,
  uploadMultiple.array("images", 10),
  restaurantController.createRestaurant,
);

router.patch(
  "/:id",
  protect,
  uploadMultiple.array("images", 10),
  restaurantController.updateRestaurant,
);

// Soft delete restaurant
router.delete("/:id", protect, restaurantController.deleteRestaurant);

router.patch(
  "/:id/toggle-status",
  protect,
  restaurantController.toggleRestaurantStatus,
);

router.delete(
  "/:id/images/:imageId",
  protect,
  restaurantController.deleteRestaurantImage,
);

router.patch(
  "/:id/images/:imageId/primary",
  protect,
  restaurantController.setPrimaryImage,
);

router.delete(
  "/:id/permanent",
  protect,
  restaurantController.permanentDeleteRestaurant,
);

module.exports = router;

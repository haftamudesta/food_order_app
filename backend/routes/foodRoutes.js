const express = require("express");
const foodControllers = require("../controllers/foodController");
const { protect } = require("../middleware/Protect");
const authorizeRoles = require("../middleware/authorizeRoles");
const { uploadMultiple } = require("../config/cloudinary");

const router = express.Router();

router.get("/search", foodControllers.searchFoodItems);
router.get("/popular", foodControllers.getPopularItems);
router.get("/discounted", foodControllers.getDiscountedItems);
router.get("/allfoods", foodControllers.getAllFoodItems);
router.get("/:id", foodControllers.getFoodItemById);
router.get(
  "/menu/:menuId/category/:category",
  foodControllers.getItemsByCategory,
);
router.get("/menu/:menuId", foodControllers.getMenuItems);

router.post(
  "/",
  protect,
  uploadMultiple.array("images", 5),
  foodControllers.createFoodItem,
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "restaurant_owner"),
  foodControllers.updateFoodItem,
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "restaurant_owner"),
  foodControllers.deleteFoodItem,
);

router.post(
  "/:id/increment-order",
  protect,
  foodControllers.incrementOrderCount,
);

module.exports = router;

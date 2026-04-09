const express = require("express");
const menuControllers = require("../controllers/menuController");

const router = express.Router();

router.get("/", menuControllers.getAllMenus);
router.post("/", menuControllers.createMenu);

router.delete("/:menuId", menuControllers.deleteMenu);
router.post("/:menuId/items", menuControllers.addItemsToMenu);

router.delete("/:menuId/items", menuControllers.removeItemsFromMenu);


router.get("/restaurant/:restaurantId", menuControllers.getMenuByRestaurant);
router.put("/:menuId", isAuthenticatedUser, authorizeRoles("admin", "restaurant_owner"), menuControllers.updateMenu);

module.exports = router;
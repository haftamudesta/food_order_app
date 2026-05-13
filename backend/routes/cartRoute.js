const express = require("express");
const cartController = require("../controllers/cartController");
const authorizeRoles = require("../middleware/authorizeRoles");
const { protect } = require("../middleware/protect");

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get("/", cartController.getCart);
router.get("/summary", cartController.getCartSummary);
router.post("/add", cartController.addToCart);
router.put("/update", cartController.updateCartItem);
router.delete("/remove/:itemId", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);
router.post("/coupon", cartController.applyCoupon);
router.delete("/coupon", cartController.removeCoupon);

module.exports = router;
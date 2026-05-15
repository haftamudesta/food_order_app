const express = require("express");
const orderControllers = require("../controllers/orderController");
const { protect } = require("../middleware/Protect");

const router = express.Router();

router.get("/me/myorders", protect, orderControllers.myOrders);
router.get("/allorders", protect, orderControllers.getAllOrders);
router.get("/recent", protect, orderControllers.getRecentOrders);
router.get("/admin/statistics", protect, orderControllers.getOrderStatistics);


router.get("/:id", protect, orderControllers.getSingleOrder);

router.post("/new", protect, orderControllers.createOrder);
router.put("/:id/cancel", protect, orderControllers.cancelOrder);
router.put("/admin/:id/status", protect, orderControllers.updateOrderStatus);
router.delete("/admin/:id", protect, orderControllers.deleteOrder);

module.exports = router;
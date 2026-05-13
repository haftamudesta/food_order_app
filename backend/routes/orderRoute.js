const express=require("express")
const orderControllers=require("../controllers/orderController")

const router=express.Router()

router.get("/:id",orderControllers.getSingleOrder)
router.get("/me/myoreders",orderControllers.myOrders)
router.get("/allorders",orderControllers.getAllOrders)
router.post("/new", orderControllers.createOrder);
router.put("/:id/cancel", orderControllers.cancelOrder);
router.put("/admin/:id/status", orderControllers.updateOrderStatus
);
router.delete(
  "/admin/:id", 
  isAuthenticatedUser, 
  authorizeRoles("admin"), 
  orderControllers.deleteOrder
);
router.get(
  "/admin/statistics", 
  orderControllers.getOrderStatistics
);
router.get("/recent", orderControllers.getRecentOrders);
module.exports=router;
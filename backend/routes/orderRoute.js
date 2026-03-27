const express=require("express")
const orderControllers=require("../controllers/orderController")

const router=express.Router()

router.get("/:id",orderControllers.getSingleOrder)
router.get("/me/myoreders",orderControllers.myOrders)
router.get("/allorders",orderControllers.getAllOrders)

module.exports=router;
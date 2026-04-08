const express=require("express")
const foodControllers=require("../controllers/foodController")
const authorizeRoles=require("../middleware/authorizeRoles")

const router=express.Router()

router.get("/search", foodControllers.searchFoodItems);
router.get("/popular", foodControllers.getPopularItems);
router.get("/discounted", foodControllers.getDiscountedItems);

router.get("/allfoods",foodControllers.getAllFoodItems)
router.get("/:id",foodControllers.getFoodItemById)
router.delete("/:id",authorizeRoles("admin", "restaurant_owner"),foodControllers.deleteFoodItem)
router.put("/:id",authorizeRoles("admin", "restaurant_owner"),foodControllers.updateFoodItem)
// router.get("/me/myoreders",foodControllers)

module.exports=router;

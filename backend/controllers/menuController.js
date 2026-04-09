const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const AppError = require("../utils/errorHandler");
const Menu=require("../models/menu")

exports.getAllMenus=catchAsyncErrors(async(req,res,next)=>{
    const filter=req.params.storeId?{restaurant:req.params.storeId}:{}
    const menu=await Menu.find(filter).populate("menu.items")
    res.status(200).json({
        success:true,
        count:menu.length,
        menu
    })
})

exports.createMenu=catchAsyncErrors(async(req,res,next)=>{
    const menu=await Menu.create(req.body)

    if (menu.menu && menu.menu.length > 0) {
        await menu.populate("menu.items");
    }
    res.status(200).json({
        success:true,
        data:menu
    })
})

exports.deleteMenu=catchAsyncErrors(async(req,res,next)=>{
    const menu=await Menu.findByIdAndDelete(req.params.menuId)
    if(!menu){
        return next(new AppError("Menu not found with this Id",404))
    }
    res.status(204).json({success:true})
})

exports.addItemsToMenu=catchAsyncErrors(async(req,res,next)=>{
    const {category,foodItemId}=req.body;
    const menuId=req.params.menuId
    if(!menuId){
        return next(new AppError("Please provide menu Id",404))
    }
     if (!category) {
        return next(new AppError("Please provide category", 400));
    }
    if (!foodItemId) {
        return next(new AppError("Please provide food item ID", 400));
    }
    const menu=await Menu.findById(menuId)
     if(!menu){
        return next(new AppError("Menu not found with this Id",404))
    }
    let cat=menu.menu.find((c)=>c.category===category)
    if(!cat){
        cat={category,items:[]}
        menu.menu.push(cat)
    }
    // Check if item already exists in this category
    if (cat.items.includes(foodItemId)) {
        return next(new AppError("Food item already exists in this category", 400));
    }
    //Add food item to category
    cat.items.push(foodItemId)
    await menu.save()
    await menu.populate("menu.items")
    res.status(200).json({success:true,data:menu});
})

exports.removeItemsFromMenu = catchAsyncErrors(async (req, res, next) => {
    const { category, foodItemId } = req.body;
    const menuId = req.params.menuId;
    
    if (!menuId || !category || !foodItemId) {
        return next(new AppError("Please provide menuId, category, and foodItemId", 400));
    }
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
        return next(new AppError("Menu not found with this Id", 404));
    }
    
    const catIndex = menu.menu.findIndex((c) => c.category === category);
    if (catIndex === -1) {
        return next(new AppError("Category not found", 404));
    }
    const itemIndex = menu.menu[catIndex].items.indexOf(foodItemId);
    if (itemIndex === -1) {
        return next(new AppError("Food item not found in this category", 404));
    }
    
    menu.menu[catIndex].items.splice(itemIndex, 1);
    
    if (menu.menu[catIndex].items.length === 0) {
        menu.menu.splice(catIndex, 1);
    }
     await menu.save();
    await menu.populate("menu.items");
    
    res.status(200).json({
        success: true,
        data: menu
    });
});

exports.getMenuByRestaurant = catchAsyncErrors(async (req, res, next) => {
    const menu = await Menu.findOne({ restaurant: req.params.restaurantId })
        .populate("menu.items");
    
    if (!menu) {
        return next(new AppError("Menu not found for this restaurant", 404));
    }
    
    res.status(200).json({
        success: true,
        data: menu
    });
});
exports.updateMenu = catchAsyncErrors(async (req, res, next) => {
  const menu = await Menu.findByIdAndUpdate(
    req.params.menuId,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate("menu.items");
  
  if (!menu) {
    return next(new AppError("Menu not found with this Id", 404));
  }
  res.status(200).json({
    success: true,
    data: menu
  });
});


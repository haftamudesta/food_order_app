const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const AppError = require("../utils/errorHandler");
const FoodItem = require("../models/foodItem");
const Menu = require("../models/menu");

exports.getAllFoodItems = catchAsyncErrors(async (req, res, next) => {
    console.log("food route hitted...")
    const { restaurantId, isAvailable, category, minPrice, maxPrice, isPopular, isNew } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (restaurantId) filter.restaurant = restaurantId;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (isPopular !== undefined) filter.isPopular = isPopular === 'true';
    if (isNew !== undefined) filter.isNew = isNew === 'true';
    
    // Price range filter
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortBy = req.query.sortBy || '-createdAt'; // Default sort by newest
    
    const foodItems = await FoodItem.find(filter)
        .populate('restaurant', 'name address')
        .populate('createdBy', 'name email')
        .sort(sortBy)
        .skip(skip)
        .limit(limit);
    
    const total = await FoodItem.countDocuments(filter);
    res.status(200).json({
        success: true,
        count: foodItems.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: foodItems
    });
});

exports.getFoodItemById = catchAsyncErrors(async (req, res, next) => {
    const foodItem = await FoodItem.findById(req.params.id)
        .populate('restaurant', 'name address phone')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');
    
    if (!foodItem) {
        return next(new AppError("Food item not found", 404));
    }
    
    res.status(200).json({
        success: true,
        data: foodItem
    });
});

exports.createFoodItem = catchAsyncErrors(async (req, res, next) => {
    req.body.createdBy = req.user.id;
    
    const existingItem = await FoodItem.findOne({
        restaurant: req.body.restaurant,
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }
    });
    
    if (existingItem) {
        return next(new AppError("Food item with this name already exists in this restaurant", 400));
    }
    const foodItem = await FoodItem.create(req.body);
    
    res.status(201).json({
        success: true,
        message: "Food item created successfully",
        data: foodItem
    });
});

exports.updateFoodItem = catchAsyncErrors(async (req, res, next) => {
    req.body.updatedBy = req.user.id;
    
    let foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
        return next(new AppError("Food item not found", 404));
    }

    // Check if updating name and if it already exists
    if (req.body.name && req.body.name !== foodItem.name) {
        const existingItem = await FoodItem.findOne({
            restaurant: foodItem.restaurant,
            name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
            _id: { $ne: req.params.id }
        });
        if (existingItem) {
            return next(new AppError("Food item with this name already exists in this restaurant", 400));
        }
    }
    
    foodItem = await FoodItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );
     res.status(200).json({
        success: true,
        message: "Food item updated successfully",
        data: foodItem
    });
});

exports.deleteFoodItem = catchAsyncErrors(async (req, res, next) => {
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
        return next(new AppError("Food item not found", 404));
    }
    
    // Option 1: Soft delete (recommended)
    foodItem.isAvailable = false;
    await foodItem.save();
    
    res.status(200).json({
        success: true,
        message: "Food item deleted successfully"
    });
});

exports.searchFoodItems = catchAsyncErrors(async (req, res, next) => {
    const { query, restaurantId, ...filters } = req.query;
    
    if (!query && !restaurantId) {
        return next(new AppError("Please provide search query or restaurant ID", 400));
    }
    
    const searchResults = await FoodItem.search(restaurantId, query, filters);
    
    res.status(200).json({
        success: true,
        count: searchResults.length,
        data: searchResults
    });
});

exports.getPopularItems = catchAsyncErrors(async (req, res, next) => {
    const { restaurantId, limit = 10 } = req.query;
    
    if (!restaurantId) {
        return next(new AppError("Please provide restaurant ID", 400));
    }
    
    const popularItems = await FoodItem.getPopularItems(restaurantId, parseInt(limit));
    
    res.status(200).json({
        success: true,
        count: popularItems.length,
        data: popularItems
    });
});

exports.getDiscountedItems = catchAsyncErrors(async (req, res, next) => {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
        return next(new AppError("Please provide restaurant ID", 400));
    }
    
    const discountedItems = await FoodItem.getDiscountedItems(restaurantId);
    
    res.status(200).json({
        success: true,
        count: discountedItems.length,
        data: discountedItems
    });
});

exports.getItemsByCategory = catchAsyncErrors(async (req, res, next) => {
    const { menuId, category } = req.params;
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
        return next(new AppError("Menu not found", 404));
    }
    
    const categoryData = menu.menu.find(cat => cat.category === category);
    if (!categoryData) {
        return next(new AppError("Category not found in this menu", 404));
    }
    
    const items = await FoodItem.find({
        _id: { $in: categoryData.items },
        isAvailable: true
    });
    res.status(200).json({
        success: true,
        category,
        count: items.length,
        data: items
    });
});

exports.getMenuItems = catchAsyncErrors(async (req, res, next) => {
    const { menuId } = req.params;
    
    const menu = await Menu.findById(menuId).populate('menu.items');
    
    if (!menu) {
        return next(new AppError("Menu not found", 404));
    }
    
    res.status(200).json({
        success: true,
        data: menu
    });
});

exports.incrementOrderCount = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    
    const foodItem = await FoodItem.findById(id);
    if (!foodItem) {
        return next(new AppError("Food item not found", 404));
    }
    
    const newCount = await foodItem.incrementOrderCount(quantity);
    
    res.status(200).json({
        success: true,
        message: "Order count updated",
        orderCount: newCount
    });
});
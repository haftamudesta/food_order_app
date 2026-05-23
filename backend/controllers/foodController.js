const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const AppError = require("../utils/errorHandler");
const FoodItem = require("../models/foodItem");
const Menu = require("../models/menu");
const { cloudinary, uploadToCloudinary } = require("../config/cloudinary");

const generateSlug = (name, restaurantId) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 60);

  const restaurantIdShort = restaurantId.toString().slice(-6);
  return `${baseSlug}-${restaurantIdShort}`;
};

const validateDiscountDates = (discount, startDate, endDate) => {
  if (discount > 0) {
    if (!startDate || !endDate) {
      throw new Error(
        "Discount start and end dates are required when discount is applied",
      );
    }
    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error("Discount start date must be before end date");
    }
  }
  return true;
};

exports.getAllFoodItems = catchAsyncErrors(async (req, res, next) => {
  const { restaurantId, isAvailable, minPrice, maxPrice, isPopular, isNew } =
    req.query;

  const filter = {};

  if (restaurantId) filter.restaurant = restaurantId;
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";
  if (isPopular !== undefined) filter.isPopular = isPopular === "true";
  if (isNew !== undefined) filter.isNewOne = isNew === "true";

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || "-createdAt";

  const foodItems = await FoodItem.find(filter)
    .populate("restaurant", "name address")
    .populate("createdBy", "name email")
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
    data: foodItems,
  });
});

exports.getFoodItemById = catchAsyncErrors(async (req, res, next) => {
  const foodItem = await FoodItem.findById(req.params.id)
    .populate("restaurant", "name address phone")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!foodItem) {
    return next(new AppError("Food item not found", 404));
  }

  res.status(200).json({
    success: true,
    data: foodItem,
  });
});

exports.createFoodItem = catchAsyncErrors(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(
      new AppError("You must be logged in to create a food item", 401),
    );
  }

  if (!req.body.restaurant) {
    return next(new AppError("Restaurant ID is required", 400));
  }

  if (!req.body.name) {
    return next(new AppError("Food item name is required", 400));
  }

  if (!req.body.price || req.body.price <= 0) {
    return next(new AppError("Valid price is required", 400));
  }

  try {
    validateDiscountDates(
      req.body.discount,
      req.body.discountStartDate,
      req.body.discountEndDate,
    );
  } catch (error) {
    return next(new AppError(error.message, 400));
  }

  // Check for duplicate name
  const existingItem = await FoodItem.findOne({
    restaurant: req.body.restaurant,
    name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
  });

  if (existingItem) {
    return next(
      new AppError(
        "Food item with this name already exists in this restaurant",
        400,
      ),
    );
  }

  // Generate slug
  let slug = generateSlug(req.body.name, req.body.restaurant);

  // Check for duplicate slug
  const existingSlug = await FoodItem.findOne({
    restaurant: req.body.restaurant,
    slug: slug,
  });

  if (existingSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  req.body.slug = slug;
  req.body.createdBy = req.user.id;

  if (req.files && req.files.length > 0) {
    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const result = await uploadToCloudinary(file.buffer, "food_items");
        images.push({
          url: result.secure_url,
          public_id: result.public_id,
          isPrimary: i === 0,
          caption: req.body.caption || "",
          uploadedAt: new Date(),
        });
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
      }
    }
    req.body.images = images;
  }

  // If no images uploaded, set default placeholder
  if (!req.body.images || req.body.images.length === 0) {
    req.body.images = [
      {
        url: "https://placehold.co/300x200/png?text=Food+Item",
        public_id: null,
        isPrimary: true,
        caption: "No image available",
        uploadedAt: new Date(),
      },
    ];
  }

  const foodItem = await FoodItem.create(req.body);

  res.status(201).json({
    success: true,
    message: "Food item created successfully",
    data: foodItem,
  });
});

exports.updateFoodItem = catchAsyncErrors(async (req, res, next) => {
  req.body.updatedBy = req.user.id;

  let foodItem = await FoodItem.findById(req.params.id);

  if (!foodItem) {
    return next(new AppError("Food item not found", 404));
  }

  if (req.body.discount !== undefined) {
    try {
      validateDiscountDates(
        req.body.discount,
        req.body.discountStartDate || foodItem.discountStartDate,
        req.body.discountEndDate || foodItem.discountEndDate,
      );
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  }

  if (req.body.name && req.body.name !== foodItem.name) {
    const existingItem = await FoodItem.findOne({
      restaurant: foodItem.restaurant,
      name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
      _id: { $ne: req.params.id },
    });

    if (existingItem) {
      return next(
        new AppError(
          "Food item with this name already exists in this restaurant",
          400,
        ),
      );
    }

    let slug = generateSlug(req.body.name, foodItem.restaurant);
    const existingSlug = await FoodItem.findOne({
      restaurant: foodItem.restaurant,
      slug: slug,
      _id: { $ne: req.params.id },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    req.body.slug = slug;
  }

  if (req.files && req.files.length > 0) {
    const newImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const result = await uploadToCloudinary(file.buffer, "food_items");
        newImages.push({
          url: result.secure_url,
          public_id: result.public_id,
          isPrimary: foodItem.images.length === 0 && i === 0,
          caption: req.body.caption || "",
          uploadedAt: new Date(),
        });
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
      }
    }
    req.body.images = [...foodItem.images, ...newImages];
  }

  foodItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Food item updated successfully",
    data: foodItem,
  });
});

exports.deleteFoodItem = catchAsyncErrors(async (req, res, next) => {
  const foodItem = await FoodItem.findById(req.params.id);

  if (!foodItem) {
    return next(new AppError("Food item not found", 404));
  }

  for (const image of foodItem.images) {
    if (image.public_id) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (err) {
        console.error("Error deleting image from Cloudinary:", err);
      }
    }
  }

  foodItem.isAvailable = false;
  await foodItem.save();

  res.status(200).json({
    success: true,
    message: "Food item deleted successfully",
  });
});

exports.deleteFoodImage = catchAsyncErrors(async (req, res, next) => {
  const { id, imageId } = req.params;

  const foodItem = await FoodItem.findById(id);

  if (!foodItem) {
    return next(new AppError("Food item not found", 404));
  }

  const image = foodItem.images.id(imageId);
  if (!image) {
    return next(new AppError("Image not found", 404));
  }

  if (image.public_id) {
    try {
      await cloudinary.uploader.destroy(image.public_id);
    } catch (err) {
      console.error("Error deleting image from Cloudinary:", err);
    }
  }

  image.remove();

  if (image.isPrimary && foodItem.images.length > 0) {
    foodItem.images[0].isPrimary = true;
  }

  await foodItem.save();

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    data: foodItem,
  });
});

exports.setPrimaryImage = catchAsyncErrors(async (req, res, next) => {
  const { id, imageId } = req.params;

  const foodItem = await FoodItem.findById(id);

  if (!foodItem) {
    return next(new AppError("Food item not found", 404));
  }

  foodItem.images.forEach((img) => {
    img.isPrimary = false;
  });

  const image = foodItem.images.id(imageId);
  if (!image) {
    return next(new AppError("Image not found", 404));
  }

  image.isPrimary = true;
  await foodItem.save();

  res.status(200).json({
    success: true,
    message: "Primary image updated",
    data: foodItem,
  });
});

exports.searchFoodItems = catchAsyncErrors(async (req, res, next) => {
  const { query, restaurantId, ...filters } = req.query;

  if (!query && !restaurantId) {
    return next(
      new AppError("Please provide search query or restaurant ID", 400),
    );
  }

  const searchResults = await FoodItem.search(restaurantId, query, filters);

  res.status(200).json({
    success: true,
    count: searchResults.length,
    data: searchResults,
  });
});

exports.getPopularItems = catchAsyncErrors(async (req, res, next) => {
  const { restaurantId, limit = 10 } = req.query;

  if (!restaurantId) {
    return next(new AppError("Please provide restaurant ID", 400));
  }

  const popularItems = await FoodItem.getPopularItems(
    restaurantId,
    parseInt(limit),
  );

  res.status(200).json({
    success: true,
    count: popularItems.length,
    data: popularItems,
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
    data: discountedItems,
  });
});

exports.getItemsByCategory = catchAsyncErrors(async (req, res, next) => {
  const { menuId, category } = req.params;

  const menu = await Menu.findById(menuId);
  if (!menu) {
    return next(new AppError("Menu not found", 404));
  }

  const categoryData = menu.menu.find((cat) => cat.category === category);
  if (!categoryData) {
    return next(new AppError("Category not found in this menu", 404));
  }

  const items = await FoodItem.find({
    _id: { $in: categoryData.items },
    isAvailable: true,
  });

  res.status(200).json({
    success: true,
    category,
    count: items.length,
    data: items,
  });
});

exports.getMenuItems = catchAsyncErrors(async (req, res, next) => {
  const { menuId } = req.params;

  const menu = await Menu.findById(menuId).populate("menu.items");

  if (!menu) {
    return next(new AppError("Menu not found", 404));
  }

  res.status(200).json({
    success: true,
    data: menu,
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
    orderCount: newCount,
  });
});

const Restaurant = require("../models/restaurant");
const Menu = require("../models/menu");
const Review = require("../models/Review");
const AppError = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const { cloudinary, uploadToCloudinary } = require("../config/cloudinary");

exports.createRestaurant = catchAsyncErrors(async (req, res, next) => {
  req.body.owner = req.user.id;

  const existingRestaurant = await Restaurant.findOne({ name: req.body.name });
  if (existingRestaurant) {
    return next(new AppError("Restaurant with this name already exists", 400));
  }

  if (req.files && req.files.length > 0) {
    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const result = await uploadToCloudinary(file.buffer, "restaurants");
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

  const restaurant = await Restaurant.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      restaurant,
    },
  });
});

exports.getAllRestaurants = catchAsyncErrors(async (req, res, next) => {
  let query = Restaurant.find({ isActive: true });

  if (req.query.keyword) {
    query = Restaurant.find(
      {
        isActive: true,
        $text: { $search: req.query.keyword },
      },
      { score: { $meta: "textScore" } },
    ).sort({ score: { $meta: "textScore" } });
  } else {
    query = Restaurant.find({ isActive: true });
  }

  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const restaurants = await features.query;

  let totalQuery = Restaurant.find({ isActive: true });

  if (req.query.keyword) {
    totalQuery = Restaurant.find({
      isActive: true,
      $text: { $search: req.query.keyword },
    });
  }

  if (req.query.cuisine) {
    const cuisineArray = req.query.cuisine.split(",");
    totalQuery = totalQuery.find({ cuisine: { $in: cuisineArray } });
  }

  if (req.query.city) {
    totalQuery = totalQuery.find({ "address.city": req.query.city });
  }

  if (req.query.minRating) {
    totalQuery = totalQuery.find({
      "rating.average": { $gte: parseFloat(req.query.minRating) },
    });
  }

  if (req.query.maxPrice) {
    totalQuery = totalQuery.find({
      "pricing.averageCost": { $lte: parseFloat(req.query.maxPrice) },
    });
  }

  const total = await totalQuery.countDocuments();

  res.status(200).json({
    status: "success",
    results: restaurants.length,
    total,
    data: {
      restaurants,
    },
  });
});

exports.getRestaurant = catchAsyncErrors(async (req, res, next) => {
  let query;

  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    query = Restaurant.findById(req.params.id);
  } else {
    query = Restaurant.findOne({ slug: req.params.id });
  }

  const restaurant = await query.populate("owner", "name email").populate({
    path: "reviews",
    select: "rating comment user createdAt",
    populate: {
      path: "user",
      select: "name",
    },
    options: { limit: 5, sort: "-createdAt" },
  });

  if (!restaurant || !restaurant.isActive) {
    return next(new AppError("No restaurant found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      restaurant,
    },
  });
});

exports.updateRestaurant = catchAsyncErrors(async (req, res, next) => {
  let restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError("No restaurant found with that ID", 404));
  }

  if (
    restaurant.owner.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You do not have permission to update this restaurant", 403),
    );
  }

  const allowedUpdates = [
    "name",
    "description",
    "cuisine",
    "address",
    "contact",
    "operatingHours",
    "pricing",
    "amenities",
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field]) {
      restaurant[field] = req.body[field];
    }
  });

  if (req.files && req.files.length > 0) {
    const newImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const result = await uploadToCloudinary(file.buffer, "restaurants");
        newImages.push({
          url: result.secure_url,
          public_id: result.public_id,
          isPrimary: restaurant.images.length === 0 && i === 0,
          caption: req.body.caption || "",
          uploadedAt: new Date(),
        });
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
      }
    }
    restaurant.images = [...restaurant.images, ...newImages];
  }

  await restaurant.save();

  res.status(200).json({
    status: "success",
    data: {
      restaurant,
    },
  });
});

exports.deleteRestaurant = catchAsyncErrors(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError("No restaurant found with that ID", 404));
  }

  if (
    restaurant.owner.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You do not have permission to delete this restaurant", 403),
    );
  }

  restaurant.isActive = false;
  await restaurant.save();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.permanentDeleteRestaurant = catchAsyncErrors(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError("No restaurant found with that ID", 404));
  }

  if (req.user.role !== "admin") {
    return next(
      new AppError(
        "You do not have permission to permanently delete this restaurant",
        403,
      ),
    );
  }

  for (const image of restaurant.images) {
    if (image.public_id) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (err) {
        console.error("Error deleting image from Cloudinary:", err);
      }
    }
  }

  await Menu.deleteMany({ restaurant: restaurant._id });
  await Review.deleteMany({ restaurant: restaurant._id });

  await restaurant.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMyRestaurants = catchAsyncErrors(async (req, res, next) => {
  const restaurants = await Restaurant.find({
    owner: req.user.id,
    isActive: true,
  })
    .select("name slug rating averageCost images isVerified")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: restaurants.length,
    data: {
      restaurants,
    },
  });
});

exports.searchRestaurants = catchAsyncErrors(async (req, res, next) => {
  const { query, cuisine, city, minRating, maxPrice } = req.query;

  const searchQuery = { isActive: true };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  if (cuisine) {
    searchQuery.cuisine = { $in: cuisine.split(",") };
  }

  if (city) {
    searchQuery["address.city"] = city;
  }

  if (minRating) {
    searchQuery["rating.average"] = { $gte: parseFloat(minRating) };
  }

  if (maxPrice) {
    searchQuery["pricing.averageCost"] = { $lte: parseFloat(maxPrice) };
  }

  const restaurants = await Restaurant.find(searchQuery)
    .select("name slug description cuisine rating images pricing")
    .sort("-rating.average");

  res.status(200).json({
    status: "success",
    results: restaurants.length,
    data: {
      restaurants,
    },
  });
});

exports.getRestaurantStats = catchAsyncErrors(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError("No restaurant found with that ID", 404));
  }

  const reviewStats = await Review.aggregate([
    { $match: { restaurant: restaurant._id } },
    {
      $group: {
        _id: "$restaurant",
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
  ]);

  const menuStats = await Menu.aggregate([
    { $match: { restaurant: restaurant._id } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (reviewStats[0] && reviewStats[0].ratingDistribution) {
    reviewStats[0].ratingDistribution.forEach((rating) => {
      ratingDistribution[rating]++;
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      restaurant: {
        name: restaurant.name,
        rating: restaurant.rating,
        totalReviews: reviewStats[0]?.totalReviews || 0,
        averageRating: reviewStats[0]?.averageRating || 0,
        ratingDistribution,
      },
      menuStats,
      totalMenuItems: await Menu.countDocuments({ restaurant: restaurant._id }),
    },
  });
});

exports.setPrimaryImage = catchAsyncErrors(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError("No restaurant found with that ID", 404));
  }

  if (
    restaurant.owner.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You do not have permission to update images", 403),
    );
  }

  let found = false;
  restaurant.images.forEach((img) => {
    if (img._id.toString() === req.params.imageId) {
      img.isPrimary = true;
      found = true;
    } else {
      img.isPrimary = false;
    }
  });

  if (!found) {
    return next(new AppError("Image not found", 404));
  }

  await restaurant.save();

  res.status(200).json({
    status: "success",
    data: {
      images: restaurant.images,
    },
  });
});

exports.deleteRestaurantImage = catchAsyncErrors(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError("No restaurant found with that ID", 404));
  }

  if (
    restaurant.owner.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You do not have permission to delete images", 403),
    );
  }

  const image = restaurant.images.id(req.params.imageId);
  if (!image) {
    return next(new AppError("Image not found", 404));
  }

  // Delete from Cloudinary
  if (image.public_id) {
    try {
      await cloudinary.uploader.destroy(image.public_id);
    } catch (err) {
      console.error("Error deleting image from Cloudinary:", err);
    }
  }

  image.remove();

  // If the deleted image was primary and there are other images, set the first as primary
  if (image.isPrimary && restaurant.images.length > 0) {
    restaurant.images[0].isPrimary = true;
  }

  await restaurant.save();

  res.status(200).json({
    status: "success",
    message: "Image deleted successfully",
    data: {
      images: restaurant.images,
    },
  });
});

exports.toggleRestaurantStatus = catchAsyncErrors(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError("No restaurant found with that ID", 404));
  }

  if (
    restaurant.owner.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You do not have permission to modify this restaurant", 403),
    );
  }

  restaurant.isActive = !restaurant.isActive;
  await restaurant.save();

  res.status(200).json({
    status: "success",
    message: `Restaurant ${restaurant.isActive ? "activated" : "deactivated"} successfully`,
    data: {
      isActive: restaurant.isActive,
    },
  });
});

// Get operating hours
exports.getOperatingHours = catchAsyncErrors(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id).select(
    "operatingHours name",
  );

  if (!restaurant) {
    return next(new AppError("No restaurant found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      restaurant: restaurant.name,
      operatingHours: restaurant.operatingHours,
    },
  });
});

exports.checkIsOpen = catchAsyncErrors(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError("No restaurant found with that ID", 404));
  }

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const currentDay = days[new Date().getDay()];
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const isOpen = restaurant.isOpen(currentDay, currentTime);

  res.status(200).json({
    status: "success",
    data: {
      isOpen,
      currentDay,
      currentTime,
      hours: restaurant.operatingHours[currentDay],
    },
  });
});

exports.getFeaturedRestaurants = catchAsyncErrors(async (req, res, next) => {
  const restaurants = await Restaurant.find({
    isActive: true,
    isVerified: true,
    "rating.average": { $gte: 4 },
  })
    .select("name slug description cuisine rating images pricing")
    .sort("-rating.average")
    .limit(10);

  res.status(200).json({
    status: "success",
    results: restaurants.length,
    data: {
      restaurants,
    },
  });
});

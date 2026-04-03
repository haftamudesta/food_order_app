const Restaurant = require('../models/restaurant');
const Menu = require('../models/menu');
const Review = require('../models/Review');
const AppError = require('../utils/errorHandler');
const catchAsync = require('../middleware/catchAsycErrors');
const APIFeatures = require('../utils/apiFeatures');

exports.createRestaurant = catchAsync(async (req, res, next) => {
  req.body.owner = req.user.id;
  const existingRestaurant = await Restaurant.findOne({ name: req.body.name });
  if (existingRestaurant) {
    return next(new AppError('Restaurant with this name already exists', 400));
  }
  
  const restaurant = await Restaurant.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      restaurant
    }
  });
});

exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Restaurant.find({ isActive: true }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const restaurants = await features.query;
  
  const total = await Restaurant.countDocuments({ isActive: true });
  
  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    total,
    data: {
      restaurants
    }
  });
});

exports.getRestaurant = catchAsync(async (req, res, next) => {
  let query;
  
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    query = Restaurant.findById(req.params.id);
  } else {
    query = Restaurant.findOne({ slug: req.params.id });
  }
  
  const restaurant = await query
    .populate('owner', 'name email')
    .populate({
      path: 'reviews',
      select: 'rating comment user createdAt',
      populate: {
        path: 'user',
        select: 'name'
      },
      options: { limit: 5, sort: '-createdAt' }
    });
  
  if (!restaurant || !restaurant.isActive) {
    return next(new AppError('No restaurant found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      restaurant
    }
  });
});

exports.updateRestaurant = catchAsync(async (req, res, next) => {
  let restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }
  
  if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this restaurant', 403));
  }
  
  const allowedUpdates = [
    'name', 'description', 'cuisine', 'address', 'contact', 
    'operatingHours', 'pricing', 'amenities', 'images'
  ];
  
  allowedUpdates.forEach(field => {
    if (req.body[field]) {
      restaurant[field] = req.body[field];
    }
  });
  
  await restaurant.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      restaurant
    }
  });
});

exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }
  
  if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to delete this restaurant', 403));
  }
  
  restaurant.isActive = false;
  await restaurant.save();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});


exports.permanentDeleteRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }
  
  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to permanently delete this restaurant', 403));
  }
  
  await Menu.deleteMany({ restaurant: restaurant._id });
  await Review.deleteMany({ restaurant: restaurant._id });
  
  await restaurant.remove();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getMyRestaurants = catchAsync(async (req, res, next) => {
  const restaurants = await Restaurant.find({ 
    owner: req.user.id,
    isActive: true 
  })
  .select('name slug rating averageCost images isVerified')
  .sort('-createdAt');
  
  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: {
      restaurants
    }
  });
});

exports.searchRestaurants = catchAsync(async (req, res, next) => {
  const { query, cuisine, city, minRating, maxPrice } = req.query;
  
  const searchQuery = { isActive: true };
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (cuisine) {
    searchQuery.cuisine = { $in: cuisine.split(',') };
  }
  
  if (city) {
    searchQuery['address.city'] = city;
  }
  
  if (minRating) {
    searchQuery['rating.average'] = { $gte: parseFloat(minRating) };
  }
  
  if (maxPrice) {
    searchQuery['pricing.averageCost'] = { $lte: parseFloat(maxPrice) };
  }
  
  const restaurants = await Restaurant.find(searchQuery)
    .select('name slug description cuisine rating images pricing')
    .sort('-rating.average');
  
  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: {
      restaurants
    }
  });
});


exports.getRestaurantStats = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }
  
  // Get review statistics
  const reviewStats = await Review.aggregate([
    { $match: { restaurant: restaurant._id } },
    { $group: {
      _id: '$restaurant',
      totalReviews: { $sum: 1 },
      averageRating: { $avg: '$rating' },
      ratingDistribution: {
        $push: '$rating'
      }
    }}
  ]);
  
  // Get menu statistics
  const menuStats = await MenuItem.aggregate([
    { $match: { restaurant: restaurant._id } },
    { $group: {
      _id: '$category',
      count: { $sum: 1 },
      avgPrice: { $avg: '$price' },
      minPrice: { $min: '$price' },
      maxPrice: { $max: '$price' }
    }},
    { $sort: { _id: 1 } }
  ]);
  
  // Calculate rating distribution
  let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (reviewStats[0] && reviewStats[0].ratingDistribution) {
    reviewStats[0].ratingDistribution.forEach(rating => {
      ratingDistribution[rating]++;
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      restaurant: {
        name: restaurant.name,
        rating: restaurant.rating,
        totalReviews: reviewStats[0]?.totalReviews || 0,
        averageRating: reviewStats[0]?.averageRating || 0,
        ratingDistribution
      },
      menuStats,
      totalMenuItems: await MenuItem.countDocuments({ restaurant: restaurant._id })
    }
  });
});


exports.setPrimaryImage = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }
  
  if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update images', 403));
  }
  
  let found = false;
  restaurant.images.forEach(img => {
    if (img._id.toString() === req.params.imageId) {
      img.isPrimary = true;
      found = true;
    } else {
      img.isPrimary = false;
    }
  });
  
  if (!found) {
    return next(new AppError('Image not found', 404));
  }
  
  await restaurant.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      images: restaurant.images
    }
  });
});

exports.toggleRestaurantStatus = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }
  
  if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to modify this restaurant', 403));
  }
  
  restaurant.isActive = !restaurant.isActive;
  await restaurant.save();
  
  res.status(200).json({
    status: 'success',
    message: `Restaurant ${restaurant.isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      isActive: restaurant.isActive
    }
  });
});


exports.getOperatingHours = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id).select('operatingHours name');
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      restaurant: restaurant.name,
      operatingHours: restaurant.operatingHours
    }
  });
});


exports.checkIsOpen = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }
  
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[new Date().getDay()];
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  
  const isOpen = restaurant.isOpen(currentDay, currentTime);
  
  res.status(200).json({
    status: 'success',
    data: {
      isOpen,
      currentDay,
      currentTime,
      hours: restaurant.operatingHours[currentDay]
    }
  });
});


exports.getFeaturedRestaurants = catchAsync(async (req, res, next) => {
  const restaurants = await Restaurant.find({ 
    isActive: true,
    isVerified: true,
    'rating.average': { $gte: 4 }
  })
  .select('name slug description cuisine rating images pricing')
  .sort('-rating.average')
  .limit(10);
  
  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: {
      restaurants
    }
  });
});
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Ensure one review per user per restaurant
reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });

// Update restaurant rating when review is saved or removed
reviewSchema.post('save', async function() {
  await this.constructor.updateRestaurantRating(this.restaurant);
});

reviewSchema.post('remove', async function() {
  await this.constructor.updateRestaurantRating(this.restaurant);
});

// Static method to update restaurant rating
reviewSchema.statics.updateRestaurantRating = async function(restaurantId) {
  const Restaurant = mongoose.model('Restaurant');
  
  const stats = await this.aggregate([
    { $match: { restaurant: restaurantId } },
    { $group: {
      _id: '$restaurant',
      avgRating: { $avg: '$rating' },
      count: { $sum: 1 }
    }}
  ]);
  
  const rating = stats.length ? {
    average: Number((stats[0].avgRating).toFixed(1)),
    count: stats[0].count
  } : { average: 0, count: 0 };
  
  await Restaurant.findByIdAndUpdate(restaurantId, { rating });
};

// Static method to get reviews with pagination
reviewSchema.statics.getReviews = function(restaurantId, page = 1, limit = 10) {
  return this.find({ restaurant: restaurantId })
    .populate('user', 'name')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);
};

module.exports = mongoose.model('Review', reviewSchema);
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant reference is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters'],
    index: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Appetizer',
      'Main Course',
      'Dessert',
      'Beverage',
      'Side Dish',
      'Soup',
      'Salad',
      'Breakfast',
      'Lunch Special',
      'Dinner Special',
      'Kids Menu',
      'Vegan',
      'Vegetarian',
      'Gluten-Free',
      'Signature Dish',
      'Special'
    ],
    index: true
  },
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'Price must be a positive number'
    }
  },
  
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'ETB', 'CAD', 'AUD']
  },
  
  servingSize: {
    type: String,
    trim: true,
    example: '1 plate, 250g, 2 pieces'
  },
  
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    alt: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
  
  isPopular: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: 0,
    max: 200,
    help: 'Discount percentage'
  },
  discountStartDate: Date,
  discountEndDate: Date,
  orderCount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ restaurant: 1, category: 1 });
menuItemSchema.index({ restaurant: 1, price: 1 });

menuItemSchema.pre('save', function(next) {
  // Generate slug from name
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
    
    // Add restaurant ID to make slug unique per restaurant
    if (this.restaurant) {
      this.slug = `${this.slug}-${this.restaurant}`;
    }
  }
  
  
  // Check discount dates
  if (this.discount > 0) {
    if (!this.discountStartDate || !this.discountEndDate) {
      next(new Error('Discount start and end dates are required when discount is applied'));
    }
    if (this.discountStartDate >= this.discountEndDate) {
      next(new Error('Discount start date must be before end date'));
    }
  }
  
  next();
});

// Virtual for discounted price
menuItemSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0 && this.discountStartDate <= new Date() && this.discountEndDate >= new Date()) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});


// Static  Method for Order Tracking
menuItemSchema.methods.incrementOrderCount = async function(quantity = 1) {
  this.orderCount += quantity;
  await this.save();
  return this.orderCount;
};


// Static method to get popular items
menuItemSchema.statics.getPopularItems = function(restaurantId, limit = 10) {
  return this.find({ 
    restaurant: restaurantId,
    isAvailable: true,
    orderCount: { $gt: 0 }
  })
  .sort('-orderCount')
  .limit(limit)
  .select('name price images orderCount');
};

// Static method to search menu items
menuItemSchema.statics.search = function(restaurantId, query, filters = {}) {
  const searchQuery = { 
    restaurant: restaurantId,
    'isAvailable': true 
  };
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  
  
  if (filters.maxPrice) {
    searchQuery.price = { $lte: filters.maxPrice };
  }
  
  if (filters.minPrice) {
    searchQuery.price = { ...searchQuery.price, $gte: filters.minPrice };
  }
  
  if (filters.isPopular) {
    searchQuery.isPopular = true;
  }
  
  if (filters.isNew) {
    searchQuery.isNew = true;
  }
  
  return this.find(searchQuery)
    .sort({ 
      isRecommended: -1,
      orderCount: -1,
      price: filters.sortByPrice === 'asc' ? 1 : filters.sortByPrice === 'desc' ? -1 : 0
    });
};

// Static method to get menu by category
menuItemSchema.statics.getMenuByCategory = async function(restaurantId) {
  const menuItems = await this.find({ 
    restaurant: restaurantId,
    'isAvailable': true 
  }).sort('category name');
  
  return menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
};

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
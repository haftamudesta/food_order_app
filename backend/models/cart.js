const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  specialInstructions: {
    type: String,
    maxlength: 200,
    trim: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [cartItemSchema],
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: false
  },
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    trim: true
  },
  discount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

cartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.tax = this.subtotal * 0.1;
  this.deliveryFee = this.subtotal < 50 ? 5 : 0;
  this.total = this.subtotal + this.tax + this.deliveryFee - this.discount;
  next();
});

cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.methods.isSameRestaurant = function(restaurantId) {
  return !this.restaurant || this.restaurant.toString() === restaurantId;
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  this.restaurant = null;
  this.couponCode = null;
  this.discount = 0;
  this.notes = null;
  return this.save();
};

cartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ user: userId }).populate('items.foodItem');
  if (!cart) {
    cart = await this.create({ user: userId });
  }
  return cart;
};

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
module.exports = Cart;
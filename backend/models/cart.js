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
  items: {
    type: [cartItemSchema],
    default: []
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null
  },
  couponCode: {
    type: String,
    default: null
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
  timestamps: true
});


cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.restaurant = null;
  this.couponCode = null;
  this.discount = 0;
  this.notes = null;
  await this.save();
  return this;
};

cartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ user: userId });
  if (!cart) {
    cart = await this.create({ user: userId, items: [] });
  }
  return cart;
};

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
module.exports = Cart;
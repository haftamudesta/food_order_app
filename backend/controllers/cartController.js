// controllers/cartController.js
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const AppError = require("../utils/errorHandler");
const Cart = require("../models/cart");
const FoodItem = require("../models/foodItem");

exports.getCart = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.foodItem')
    .populate('restaurant', 'name address images cuisine');
  
  if (!cart) {
    return res.status(200).json({
      success: true,
      data: {
        items: [],
        restaurant: null,
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        discount: 0,
        total: 0,
        itemCount: 0,
        couponCode: null
      }
    });
  }
  
  // Calculate totals
  const totals = cart.calculateTotals();
  
  res.status(200).json({
    success: true,
    data: {
      items: cart.items,
      restaurant: cart.restaurant,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      discount: cart.discount || 0,
      total: totals.total,
      itemCount: totals.itemCount,
      couponCode: cart.couponCode
    }
  });
});

exports.addToCart = catchAsyncErrors(async (req, res, next) => {
  const { foodItemId, quantity = 1, specialInstructions = "" } = req.body;
  
  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }
  
  const foodItem = await FoodItem.findById(foodItemId);
  if (!foodItem) {
    return next(new AppError("Food item not found", 404));
  }
  
  if (!foodItem.isAvailable) {
    return next(new AppError("This item is currently not available", 400));
  }
  
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
    console.log("Created new cart");
  }
  
  // If different restaurant, clear the cart first
  if (cart.restaurant && cart.restaurant.toString() !== foodItem.restaurant.toString()) {
    console.log("Different restaurant detected. Clearing cart...");
    cart.items = [];
    cart.restaurant = null;
    cart.couponCode = null;
    cart.discount = 0;
    await cart.save();
  }
  
  const currentPrice = foodItem.isDiscountActive && foodItem.discountedPrice 
    ? foodItem.discountedPrice 
    : foodItem.price;
  const totalPrice = currentPrice * quantity;
  
  const existingItemIndex = cart.items.findIndex(
    item => item.foodItem.toString() === foodItemId
  );
  
  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].totalPrice = currentPrice * cart.items[existingItemIndex].quantity;
    if (specialInstructions) {
      cart.items[existingItemIndex].specialInstructions = specialInstructions;
    }
    console.log("Updated existing item");
  } else {
    cart.items.push({
      foodItem: foodItemId,
      quantity,
      price: currentPrice,
      totalPrice,
      specialInstructions: specialInstructions || ""
    });
    console.log("Added new item");
  }
  
  if (!cart.restaurant) {
    cart.restaurant = foodItem.restaurant;
  }
  
  await cart.save();
  console.log("Cart saved");
  
  const totals = cart.calculateTotals();
  
  await cart.populate('items.foodItem');
  await cart.populate('restaurant', 'name address images cuisine');
  
  res.status(200).json({
    success: true,
    message: "Item added to cart successfully",
    data: {
      items: cart.items,
      restaurant: cart.restaurant,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      discount: cart.discount || 0,
      total: totals.total,
      itemCount: totals.itemCount,
      couponCode: cart.couponCode
    }
  });
});

exports.updateCartItem = catchAsyncErrors(async (req, res, next) => {
  const { itemId, quantity, specialInstructions } = req.body;
  
  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }
  
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }
  
  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
  if (itemIndex === -1) {
    return next(new AppError("Item not found in cart", 404));
  }
  
  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].totalPrice = cart.items[itemIndex].price * quantity;
  
  if (specialInstructions) {
    cart.items[itemIndex].specialInstructions = specialInstructions;
  }
  
  await cart.save();
  
  const totals = cart.calculateTotals();
  
  await cart.populate('items.foodItem');
  await cart.populate('restaurant', 'name address images cuisine');
  
  res.status(200).json({
    success: true,
    message: "Cart item updated successfully",
    data: {
      items: cart.items,
      restaurant: cart.restaurant,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      discount: cart.discount || 0,
      total: totals.total,
      itemCount: totals.itemCount,
      couponCode: cart.couponCode
    }
  });
});

exports.removeFromCart = catchAsyncErrors(async (req, res, next) => {
  const { itemId } = req.params;
  
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }
  
  cart.items = cart.items.filter(item => item._id.toString() !== itemId);
  
  if (cart.items.length === 0) {
    cart.restaurant = null;
    cart.couponCode = null;
    cart.discount = 0;
  }
  
  await cart.save();
  
  const totals = cart.calculateTotals();
  
  await cart.populate('items.foodItem');
  await cart.populate('restaurant', 'name address images cuisine');
  
  res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
    data: {
      items: cart.items,
      restaurant: cart.restaurant,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      discount: cart.discount || 0,
      total: totals.total,
      itemCount: totals.itemCount,
      couponCode: cart.couponCode
    }
  });
});

exports.clearCart = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    return res.status(200).json({
      success: true,
      data: {
        items: [],
        restaurant: null,
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        discount: 0,
        total: 0,
        itemCount: 0,
        couponCode: null
      }
    });
  }
  
  await cart.clearCart();
  
  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    data: {
      items: [],
      restaurant: null,
      subtotal: 0,
      tax: 0,
      deliveryFee: 0,
      discount: 0,
      total: 0,
      itemCount: 0,
      couponCode: null
    }
  });
});

exports.applyCoupon = catchAsyncErrors(async (req, res, next) => {
  const { couponCode } = req.body;
  
  const validCoupons = {
    'SAVE10': { discount: 10, type: 'percentage' },
    'SAVE20': { discount: 20, type: 'percentage' },
    'FREESHIP': { discount: 5, type: 'fixed' }
  };
  
  const coupon = validCoupons[couponCode?.toUpperCase()];
  if (!coupon) {
    return next(new AppError("Invalid coupon code", 400));
  }
  
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }
  
  const totals = cart.calculateTotals();
  
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (totals.subtotal * coupon.discount) / 100;
  } else {
    discount = coupon.discount;
  }
  
  cart.couponCode = couponCode.toUpperCase();
  cart.discount = Math.min(discount, totals.subtotal);
  await cart.save();
  
  const newTotals = cart.calculateTotals();
  
  res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    data: {
      couponCode: cart.couponCode,
      discount: cart.discount,
      subtotal: newTotals.subtotal,
      tax: newTotals.tax,
      deliveryFee: newTotals.deliveryFee,
      total: newTotals.total,
      itemCount: newTotals.itemCount
    }
  });
});

exports.removeCoupon = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }
  
  cart.couponCode = null;
  cart.discount = 0;
  await cart.save();
  
  const totals = cart.calculateTotals();
  
  res.status(200).json({
    success: true,
    message: "Coupon removed successfully",
    data: {
      items: cart.items,
      restaurant: cart.restaurant,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      discount: 0,
      total: totals.total,
      itemCount: totals.itemCount,
      couponCode: null
    }
  });
});

exports.getCartSummary = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.foodItem')
    .populate('restaurant', 'name address phone');
  
  if (!cart || cart.items.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        isEmpty: true,
        items: [],
        restaurant: null,
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        discount: 0,
        total: 0,
        itemCount: 0,
        couponCode: null
      }
    });
  }
  
  const totals = cart.calculateTotals();
  
  res.status(200).json({
    success: true,
    data: {
      isEmpty: false,
      items: cart.items,
      restaurant: cart.restaurant,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      discount: cart.discount,
      total: totals.total,
      itemCount: totals.itemCount,
      couponCode: cart.couponCode
    }
  });
});
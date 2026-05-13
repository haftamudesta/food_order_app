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
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        total: 0,
        itemCount: 0
      }
    });
  }
  
  res.status(200).json({
    success: true,
    data: cart
  });
});

exports.addToCart = catchAsyncErrors(async (req, res, next) => {
  const { foodItemId, quantity = 1, specialInstructions } = req.body;
  console.log("=== ADD TO CART DEBUG ===");
  console.log("foodItemId:", foodItemId);
  console.log("quantity:", quantity);
  console.log("userId:", req.user._id);
  
  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }
  
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
    cart = await Cart.create({ user: req.user.id });
  }
  
  if (cart.restaurant && cart.restaurant.toString() !== foodItem.restaurant.toString()) {
    return next(new AppError("Cannot add items from different restaurants. Please clear your cart first.", 400));
  }
  
  const currentPrice = foodItem.isDiscountActive ? foodItem.discountedPrice : foodItem.price;
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
  } else {
    cart.items.push({
      foodItem: foodItemId,
      quantity,
      price: currentPrice,
      totalPrice,
      specialInstructions
    });
  }
  
  if (!cart.restaurant) {
    cart.restaurant = foodItem.restaurant;
  }
  
  await cart.save();
  await cart.populate('items.foodItem');
  await cart.populate('restaurant', 'name address images cuisine');
  
  res.status(200).json({
    success: true,
    message: "Item added to cart successfully",
    data: cart
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
  await cart.populate('items.foodItem');
  await cart.populate('restaurant', 'name address images cuisine');
  
  res.status(200).json({
    success: true,
    message: "Cart item updated successfully",
    data: cart
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
  await cart.populate('items.foodItem');
  await cart.populate('restaurant', 'name address images cuisine');
  
  res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
    data: cart
  });
});

exports.clearCart = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }
  
  await cart.clearCart();
  
  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    data: {
      items: [],
      subtotal: 0,
      tax: 0,
      deliveryFee: 0,
      total: 0,
      itemCount: 0
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
  
  const coupon = validCoupons[couponCode.toUpperCase()];
  if (!coupon) {
    return next(new AppError("Invalid coupon code", 400));
  }
  
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }
  
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (cart.subtotal * coupon.discount) / 100;
  } else {
    discount = coupon.discount;
  }
  
  cart.couponCode = couponCode.toUpperCase();
  cart.discount = Math.min(discount, cart.subtotal); // Don't discount more than subtotal
  
  await cart.save();
  
  res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    data: cart
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
  
  res.status(200).json({
    success: true,
    message: "Coupon removed successfully",
    data: cart
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
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        discount: 0,
        total: 0,
        itemCount: 0
      }
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      isEmpty: false,
      items: cart.items,
      restaurant: cart.restaurant,
      subtotal: cart.subtotal,
      tax: cart.tax,
      deliveryFee: cart.deliveryFee,
      discount: cart.discount,
      total: cart.total,
      itemCount: cart.itemCount,
      couponCode: cart.couponCode
    }
  });
});
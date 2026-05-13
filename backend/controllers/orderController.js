const mongoose = require("mongoose");
const {objectId}=require("mongodb")

const Order = require("../models/order");
const FoodItem = require("../models/foodItem");
const Restaurant = require("../models/restaurant");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const AppError = require("../utils/errorHandler");

exports.getSingleOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id).populate("user","name email").populate("restaurant").exec()
    if (!order) {
            return next(new AppError("Order not found", 404));
        }
    res.status(200).json({
        success:true,
        order,
    })
})

exports.myOrders=catchAsyncErrors(async(req,res,next)=>{
    const userId=objectId(req.usr.id)
    const order=await Order.find({user:userId}).populate("user","name email").populate("restaurant").exec()

    res.status(200).json({
        success:true,
        order,
    })
})

exports.getAllOrders=catchAsyncErrors(async(req,res,next)=>{
    const orders=await Order.find()

    let totalAmount=0
    orders.forEach(order => {
        totalAmount+=order.finalTotal
    });

    res.status(200).json({
        success:true,
        orders,
    })
})

exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    deliveryInfo,
    restaurant,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    deliveryCharge,
    finalTotal,
  } = req.body;

  if (!deliveryInfo || !restaurant || !orderItems || !finalTotal) {
    return next(new AppError("Please provide all required order information", 400));
  }

  // Check if order items have sufficient stock
  for (const orderItem of orderItems) {
    const foodItem = await FoodItem.findById(orderItem.foodItem);
    if (!foodItem) {
      return next(new AppError(`Food item not found: ${orderItem.name}`, 404));
    }
    if (foodItem.stock < orderItem.quantity) {
      return next(new AppError(`Insufficient stock for ${orderItem.name}. Available: ${foodItem.stock}`, 400));
    }
  }
  const order = await Order.create({
    deliveryInfo,
    restaurant,
    user: req.user.id,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    deliveryCharge,
    finalTotal,
    paidAt: paymentInfo?.status === "paid" ? Date.now() : null,
    orderStatus: "processing",
  });

  // Clear user's cart after order creation
  await Cart.findOneAndUpdate(
    { user: req.user.id },
    { items: [], restaurant: null }
  );

  res.status(201).json({
    success: true,
    order,
  });
});


exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);
  
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check if order is already cancelled or delivered
  if (order.orderStatus === "cancelled") {
    return next(new AppError("Cannot update cancelled order", 400));
  }
  
  if (order.orderStatus === "delivered") {
    return next(new AppError("Order is already delivered", 400));
  }

  order.orderStatus = status;
  
  if (status === "delivered") {
    order.deliveredAt = Date.now();
  }
  
  if (status === "cancelled") {
    for (const orderItem of order.orderItems) {
      const foodItem = await FoodItem.findById(orderItem.foodItem);
      if (foodItem) {
        foodItem.stock += orderItem.quantity;
        await foodItem.save();
      }
    }
  }
  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});


exports.cancelOrder = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const order = await Order.findById(id);
  
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("You are not authorized to cancel this order", 403));
  }

  if (order.orderStatus !== "processing" && order.orderStatus !== "confirmed") {
    return next(new AppError(`Order cannot be cancelled because it is ${order.orderStatus}`, 400));
  }
  await order.cancelOrder();

  res.status(200).json({
    success: true,
    order,
    message: "Order cancelled successfully",
  });
});

exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const order = await Order.findById(id);
  
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // If order is not cancelled, restore stock before deletion
  if (order.orderStatus !== "cancelled") {
    for (const orderItem of order.orderItems) {
      const foodItem = await FoodItem.findById(orderItem.foodItem);
      if (foodItem) {
        foodItem.stock += orderItem.quantity;
        await foodItem.save();
      }
    }
  }
  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});

exports.getOrderStatistics = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate, restaurantId } = req.query;
  
  let query = {};
  
  // Date filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  // Restaurant filter
  if (restaurantId) {
    query.restaurant = restaurantId;
  }
  
  const orders = await Order.find(query);
   const statistics = {
    totalOrders: orders.length,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
  };

  orders.forEach(order => {
    statistics.totalRevenue += order.finalTotal;
    
    switch (order.orderStatus) {
      case "pending":
        statistics.pendingOrders++;
        break;
      case "processing":
        statistics.processingOrders++;
        break;
      case "confirmed":
        statistics.confirmedOrders++;
        break;
      case "delivered":
        statistics.deliveredOrders++;
        break;
      case "cancelled":
        statistics.cancelledOrders++;
        break;
    }
  });
  statistics.averageOrderValue = statistics.totalOrders > 0 
    ? statistics.totalRevenue / statistics.totalOrders 
    : 0;
  
  res.status(200).json({
    success: true,
    statistics,
  });
});

exports.getRecentOrders = catchAsyncErrors(async (req, res, next) => {
  const { limit = 10, page = 1 } = req.query;
  const skip = (page - 1) * limit;
  
  const query = req.user.role === "admin" ? {} : { user: req.user.id };
  
  const orders = await Order.find(query)
    .populate("restaurant", "name image")
    .sort("-createdAt")
    .skip(skip)
    .limit(parseInt(limit));
    
  const total = await Order.countDocuments(query);
  res.status(200).json({
    success: true,
    orders,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
  });
});

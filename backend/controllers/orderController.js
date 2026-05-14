const mongoose = require("mongoose");
const { objectId } = require("mongodb");

const Order = require("../models/order");
const FoodItem = require("../models/foodItem");
const Restaurant = require("../models/restaurant");
const Cart = require("../models/cart");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const AppError = require("../utils/errorHandler");

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate("user", "name email")
        .populate("restaurant")
        .exec();
    
    if (!order) {
        return next(new AppError("Order not found", 404));
    }
    
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError("You are not authorized to view this order", 403));
    }
    
    res.status(200).json({
        success: true,
        order,
    });
});

exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id; 
    const orders = await Order.find({ user: userId })
        .populate("user", "name email")
        .populate("restaurant")
        .sort("-createdAt")
        .exec();

    res.status(200).json({
        success: true,
        order: orders || [],
    });
});

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("=== GET ALL ORDERS ===");
        console.log("User role:", req.user?.role);
        
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("restaurant", "name")
            .sort("-createdAt");

        console.log(`Found ${orders?.length || 0} orders`);

        let totalAmount = 0;
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                totalAmount += order.finalTotal || 0;
            });
        }

        res.status(200).json({
            success: true,
            orders: orders || [],
            totalAmount,
        });
    } catch (error) {
        console.error("Error in getAllOrders:", error);
        return next(new AppError(error.message || "Failed to fetch orders", 500));
    }
});

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

    console.log("Creating order for user:", req.user.id);
    console.log("Order total:", finalTotal);

    if (!deliveryInfo || !restaurant || !orderItems || !finalTotal) {
        return next(new AppError("Please provide all required order information", 400));
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
        return next(new AppError("Order items are required", 400));
    }

    for (const orderItem of orderItems) {
        if (!orderItem.foodItem) {
            return next(new AppError("Each order item must have a foodItem ID", 400));
        }
        
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
        paymentInfo: paymentInfo || { status: "pending" },
        itemsPrice: itemsPrice || 0,
        taxPrice: taxPrice || 0,
        deliveryCharge: deliveryCharge || 0,
        finalTotal,
        paidAt: paymentInfo?.status === "paid" ? Date.now() : null,
        orderStatus: "processing",
    });

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
    try {
        const { startDate, endDate, restaurantId } = req.query;
        
        console.log("=== GET ORDER STATISTICS ===");
        
        let query = {};
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        if (restaurantId) {
            query.restaurant = restaurantId;
        }
        
        const orders = await Order.find(query);
        
        console.log(`Found ${orders?.length || 0} orders for statistics`);
        
        const statistics = {
            totalOrders: orders?.length || 0,
            totalRevenue: 0,
            pendingOrders: 0,
            processingOrders: 0,
            confirmedOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            averageOrderValue: 0,
        };

        if (orders && orders.length > 0) {
            orders.forEach(order => {
                statistics.totalRevenue += order.finalTotal || 0;
                
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
                    default:
                        break;
                }
            });
            
            statistics.averageOrderValue = statistics.totalOrders > 0 
                ? statistics.totalRevenue / statistics.totalOrders 
                : 0;
        }
        
        res.status(200).json({
            success: true,
            statistics,
        });
    } catch (error) {
        console.error("Error in getOrderStatistics:", error);
        return next(new AppError(error.message || "Failed to fetch statistics", 500));
    }
});

exports.getRecentOrders = catchAsyncErrors(async (req, res, next) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        console.log("=== GET RECENT ORDERS ===");
        console.log("Limit:", limit, "Page:", page);
        
        const query = req.user?.role === "admin" ? {} : { user: req.user?.id };
        
        const orders = await Order.find(query)
            .populate("restaurant", "name image")
            .populate("user", "name email")
            .sort("-createdAt")
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Order.countDocuments(query);
        
        res.status(200).json({
            success: true,
            orders: orders || [],
            total: total || 0,
            page: parseInt(page),
            pages: Math.ceil((total || 0) / parseInt(limit)),
        });
    } catch (error) {
        console.error("Error in getRecentOrders:", error);
        return next(new AppError(error.message || "Failed to fetch recent orders", 500));
    }
});
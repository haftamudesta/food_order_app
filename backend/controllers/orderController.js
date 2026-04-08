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
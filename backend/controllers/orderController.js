const mongoose = require("mongoose");
const {objectId}=require("mongodb")

const Order = require("../models/order");
const FoodItem = require("../models/FoodItem");
const Restaurant = require("../models/restaurant");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const AppError = require("../utils/errorHandler");


exports.getSingleOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id).populate("user","name email").populate("restaurant").exec()//populate=join data from other collections
    if (!order) {
            return next(new AppError("Order not found", 404));
        }
    res.status(200).json({
        success:true,
        order,
    })
})
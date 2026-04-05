const User=require("../models/user");
const jwt=require("jsonwebtoken");
const sendToken=require("../utils/SendToken")
const catchAsyncErrors=require("../middleware/catchAsyncErrors") 
const AppError=require("../utils/errorHandler")

exports.signUp=catchAsyncErrors(async(req,res,next)=>{
        const { name, email, phone, password,confirmPassword,role} = req.body;

        if (!name || !email || !phone || !password || !confirmPassword) {
        return next(new AppError("Please provide all required fields", 400));
    }

        const existingUser = await User.findOne({email });

        if (existingUser) {
            return next(new AppError(`User already exists with this ${existingUser.email}`, 400));
        }
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role,
            confirmPassword
        });

        // Send token via cookie
        sendToken(user, 201, res);
    
})

exports.login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new AppError("Invalid email or password", 401));
    }
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new AppError("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
});

exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("jwt", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "lax"
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});
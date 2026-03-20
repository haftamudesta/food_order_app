const User=require("../models/user");
const jwt=require("jsonwebtoken");
const catchAsychErrors=require("../middleware/catchAsychErrors") 
const AppError=require("../utils/errorHandler")

exports.signUp=catchAsychErrors(async(req,res)=>{
        const { name, email, phone, password,confirmPassword } = req.body;

        if (!name || !email || !phone || !password || !confirmPassword) {
        return next(new AppError("Please provide all required fields", 400));
    }

        const existingUser = await User.findOne({ 
            $or: [{ email }, { phone }] 
        });

        if (existingUser) {
            return next(new AppError(`User already exists with this ${existingUser.email}`, 400));
        }
        const user = await User.create({
            name,
            email,
            phone,
            password
        });

        // Send token via cookie
        sendToken(user, 201, res);
    
})

exports.login = catchAsychErrors(async (req, res, next) => {
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


const User=require("../models/user");
const jwt=require("jsonwebtoken");
const catchAsychErrors=require("../middleware/catchAsychErrors")

exports.signUp=catchAsychErrors(async(req,res)=>{
        const { name, email, phone, password,confirmPassword } = req.body;

        const existingUser = await User.findOne({ 
            $or: [{ email }, { phone }] 
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email or phone"
            });
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


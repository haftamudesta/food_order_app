const User = require("../models/user");
const catchAsyncErrors=require("../middleware/catchAsyncErrors")
const AppError = require("../utils/errorHandler");
const { uploadToCloudinary } = require('../config/cloudinary');

exports.getProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const { name, email,phone } = req.body;
    if (email || phone) {
        const existingUser = await User.findOne({
            _id: { $ne: req.user.id },
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            const field = existingUser.email === email ? "email" : "phone";
            return next(new AppError(`User already exists with this ${field}`, 400));
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, email, phone },
        {
            new: true,
            runValidators: true
        }
    );

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user
    });
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return next(new AppError("Please provide all password fields", 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new AppError("New passwords do not match", 400));
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    const isPasswordMatched = await user.comparePassword(currentPassword);

    if (!isPasswordMatched) {
        return next(new AppError("Current password is incorrect", 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
});

exports.deleteAccount = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.cookie("jwt", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    res.status(200).json({
        success: true,
        message: "Account deleted successfully"
    });
});

//=== ADMIN ONLY CONTROLLERS ===

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find().select("-password");

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

exports.getUserById = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
        return next(new AppError(`User not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const { role } = req.body;

    if (!role || !["user", "admin", "restaurant_owner"].includes(role)) {
        return next(new AppError("Please provide a valid role (user, admin, or restaurant_owner)", 400));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    if (!user) {
        return next(new AppError(`User not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: user
    });
});

exports.updateUserStatus = catchAsyncErrors(async (req, res, next) => {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return next(new AppError("Please provide a valid status (true/false)", 400));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    if (!user) {
        return next(new AppError(`User not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: user
    });
});

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new AppError(`User not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
});

exports.getUserStats = catchAsyncErrors(async (req, res, next) => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: "admin" });
    const regularUsers = await User.countDocuments({ role: "user" });

    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            adminUsers,
            regularUsers
        }
    });
});


exports.uploadProfilePicture = catchAsyncErrors(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload an image", 400));
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (user.profile_pic && user.profile_pic.public_id) {
        await cloudinary.uploader.destroy(user.profile_pic.public_id);
    }

    const result = await uploadToCloudinary(req.file.buffer, 'food_delivery/profiles');

    user.profile_pic = {
        public_id: result.public_id,
        url: result.secure_url
    };
    
    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profile_pic: user.profile_pic
            }
        }
    });
});

exports.removeProfilePicture = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (user.profile_pic && user.profile_pic.public_id) {
        await cloudinary.uploader.destroy(user.profile_pic.public_id);
    }

    user.profile_pic = null;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile picture removed successfully",
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profile_pic: null
            }
        }
    });
});

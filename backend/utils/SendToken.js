const jwt = require("jsonwebtoken");

const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();
    
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,// Prevents XSS attacks - cookie cannot be accessed by JavaScript
        secure: process.env.NODE_ENV === "production" ? true : false, // HTTPS only in production
        sameSite: "lax", // CSRF protection
        path: "/" // Cookie available for all routes
    };
    
    res.cookie("jwt", token, cookieOptions);
    
    user.password = undefined;
    
    res.status(statusCode).json({
        success: true,
        message: "User logged in successfully",
        token, // Optional: send token in body for mobile apps. it is not secure
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt
        }
    });
};

module.exports = sendToken;
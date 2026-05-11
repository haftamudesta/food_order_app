const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();

    const options = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    };

    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        user,
        message: statusCode === 201 ? "Account created successfully" : "Login successful"
    });
};

module.exports = sendToken;
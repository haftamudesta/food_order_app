const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    const currentYear = new Date().getFullYear();
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {

        return false;
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        pool: true, 
        maxConnections: 1, 
        rateLimit: true, 
        maxMessages: 5 
    });

    try {
        await transporter.verify();
        console.log("Email transporter verified successfully");
    } catch (verifyError) {
        console.error("Email transporter verification failed:", verifyError.message);
    }

    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    color: white;
                    margin: 0;
                    font-size: 28px;
                }
                .header p {
                    color: #ffd89b;
                    margin-top: 10px;
                }
                .content {
                    padding: 40px;
                }
                .button {
                    display: inline-block;
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    margin: 20px 0;
                    font-weight: bold;
                }
                .info {
                    background-color: #fff3e0;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #f97316;
                }
                .footer {
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #6c757d;
                }
                .footer p {
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Food Delivery</h1>
                    <p>Reset Your Password</p>
                </div>
                <div class="content">
                    <h2 style="color: #333; margin-bottom: 20px;">Hello, ${options.name || 'User'}!</h2>
                    <p style="color: #555; line-height: 1.6;">We received a request to reset your password for your Food Delivery account.</p>
                    <div class="info">
                        <p style="margin: 0; color: #f97316;"><strong>⏰ Link Expires: 10 minutes</strong></p>
                    </div>
                    <div style="text-align: center;">
                        <a href="${options.resetUrl}" class="button">Reset Password Now</a>
                    </div>
                    <p style="color: #555; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="background-color: #f4f4f4; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px;">
                        <a href="${options.resetUrl}" style="color: #f97316;">${options.resetUrl}</a>
                    </p>
                    <p style="color: #555; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${currentYear} Food Delivery App. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const mailOptions = {
        from: `"Food Delivery" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: "Reset Your Password - Food Delivery",
        html: htmlTemplate
    };

    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            return true;
        } catch (error) {
            lastError = error;
            if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            }
        }
    }
    console.error("All email attempts failed. Last error:", lastError.message);
    if (process.env.NODE_ENV === 'development') {
        return false;
    }
    throw new Error("Failed to send email after multiple attempts");
};
module.exports = sendEmail;
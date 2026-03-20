const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs"); 
const jwt=require("jsonwebtoken")


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 3 characters long"],
        maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                const ethiopianPhonePattern = /^(^\+251|^0)[1-9]\d{8}$/;
                return ethiopianPhonePattern.test(v);
            },
            message: props => `${props.value} is not a valid Ethiopian phone number! Format: +251915574522 or 0915574522`
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false 
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords do not match"
        }
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    profile_pic:{
        public_id:String,
        url:String,
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified("password")) return;
    
    this.password = await bcrypt.hash(this.password, 12);
});
// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.getJWTToken = function() {
    return jwt.sign(
        { 
            id: this._id,
            name: this.name,
            email: this.email,
            role: this.role 
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        }
    );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    deliveryInfo: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        phoneNo: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
        },
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true
            },
            foodItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "FoodItem",
                required: true,
            },
        }
    ],
    paymentInfo: {
        id: {
            type: String,
        },
        status: {
            type: String,
        }
    },
    paidAt: {
        type: Date,
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    taxPrice: {
        type: Number,
        default: 0.0,
    },
    deliveryCharge: {
        type: Number,
        default: 0.0
    },
    finalTotal: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderStatus: {
        type: String,
        required: true,
        default: "processing"
    },
    deliveredAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

orderSchema.pre("save", async function(next) {
    if (this.isNew) {
        try {
            // Get FoodItem model
            const FoodItem = mongoose.model("FoodItem");
            
            for (const orderItem of this.orderItems) {
                const foodItem = await FoodItem.findById(orderItem.foodItem);
                if (!foodItem) {
                    throw new Error(`Food Item not Found! ID: ${orderItem.foodItem}`);
                }
                if (foodItem.stock < orderItem.quantity) {
                    throw new Error(`Insufficient stock for ${orderItem.name}. Available: ${foodItem.stock}, Requested: ${orderItem.quantity}`);
                }
                foodItem.stock -= orderItem.quantity;
                await foodItem.save();
            }
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

orderSchema.methods.cancelOrder = async function() {
    if (this.orderStatus === "cancelled") {
        throw new Error("Order is already cancelled");
    }
    
    const FoodItem = mongoose.model("FoodItem");
    
    for (const orderItem of this.orderItems) {
        const foodItem = await FoodItem.findById(orderItem.foodItem);
        if (foodItem) {
            foodItem.stock += orderItem.quantity;
            await foodItem.save();
        }
    }
    
    this.orderStatus = "cancelled";
    await this.save();
};

module.exports = mongoose.model("Order", orderSchema);
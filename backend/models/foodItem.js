const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true,
      maxlength: [100, "Item name cannot exceed 100 characters"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Price must be a positive number",
      },
    },

    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      enum: ["USD", "EUR", "GBP", "ETB", "CAD", "AUD"],
    },

    servingSize: {
      type: String,
      trim: true,
      example: "1 plate, 250g, 2 pieces",
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
        alt: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    isPopular: {
      type: Boolean,
      default: false,
    },
    isNewOne: {
      type: Boolean,
      default: false,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    discountStartDate: Date,
    discountEndDate: Date,
    orderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    aiGenerated: {
      tags: [String],
      allergens: [String],
      serves: String,
      bestFor: [String],
      generatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

foodItemSchema.index({ name: "text", description: "text" });
foodItemSchema.index({ restaurant: 1, price: 1 });
foodItemSchema.index({ restaurant: 1, isPopular: -1, orderCount: -1 });

foodItemSchema.virtual("discountedPrice").get(function () {
  if (
    this.discount > 0 &&
    this.discountStartDate <= new Date() &&
    this.discountEndDate >= new Date()
  ) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

foodItemSchema.virtual("isDiscountActive").get(function () {
  if (this.discount > 0 && this.discountStartDate && this.discountEndDate) {
    const now = new Date();
    return now >= this.discountStartDate && now <= this.discountEndDate;
  }
  return false;
});

foodItemSchema.virtual("primaryImage").get(function () {
  const primary = this.images.find((img) => img.isPrimary);
  return primary || this.images[0] || null;
});

foodItemSchema.methods.incrementOrderCount = async function (quantity = 1) {
  this.orderCount += quantity;
  await this.save();
  return this.orderCount;
};

foodItemSchema.methods.getPriceDetails = function () {
  const isDiscounted = this.isDiscountActive;
  return {
    originalPrice: this.price,
    currentPrice: isDiscounted ? this.discountedPrice : this.price,
    discount: isDiscounted ? this.discount : 0,
    currency: this.currency,
    isDiscounted,
  };
};

foodItemSchema.statics.getPopularItems = function (restaurantId, limit = 10) {
  return this.find({
    restaurant: restaurantId,
    isAvailable: true,
    orderCount: { $gt: 0 },
  })
    .sort("-orderCount")
    .limit(limit)
    .select("name price images orderCount");
};

foodItemSchema.statics.search = function (restaurantId, query, filters = {}) {
  const searchQuery = {
    restaurant: restaurantId,
    isAvailable: true,
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  if (filters.maxPrice) {
    searchQuery.price = { $lte: filters.maxPrice };
  }

  if (filters.minPrice) {
    searchQuery.price = { ...searchQuery.price, $gte: filters.minPrice };
  }

  if (filters.isPopular) {
    searchQuery.isPopular = true;
  }

  if (filters.isNew) {
    searchQuery.isNewOne = true;
  }

  if (filters.hasDiscount) {
    const now = new Date();
    searchQuery.discount = { $gt: 0 };
    searchQuery.discountStartDate = { $lte: now };
    searchQuery.discountEndDate = { $gte: now };
  }

  return this.find(searchQuery).sort({
    isRecommended: -1,
    orderCount: -1,
    ...(filters.sortByPrice && {
      price: filters.sortByPrice === "asc" ? 1 : -1,
    }),
  });
};

foodItemSchema.statics.getDiscountedItems = function (restaurantId) {
  const now = new Date();
  return this.find({
    restaurant: restaurantId,
    discount: { $gt: 0 },
    discountStartDate: { $lte: now },
    discountEndDate: { $gte: now },
    isAvailable: true,
  }).sort("-discount");
};

foodItemSchema.statics.updateAvailability = async function (
  restaurantId,
  itemIds,
  isAvailable,
) {
  return this.updateMany(
    {
      restaurant: restaurantId,
      _id: { $in: itemIds },
    },
    { isAvailable },
  );
};

foodItemSchema.post("remove", async function (doc) {
  const Menu = mongoose.model("Menu");
  await Menu.updateMany(
    { "menu.items": doc._id },
    { $pull: { "menu.$.items": doc._id } },
  );
});

const FoodItem =
  mongoose.models.FoodItem || mongoose.model("FoodItem", foodItemSchema);

module.exports = FoodItem;

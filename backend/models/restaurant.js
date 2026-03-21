const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    unique: true,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  cuisine: {
    type: [String],
    required: [true, 'At least one cuisine type is required'],
    enum: ['Ethiopian','Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'American', 'Thai', 'French', 'Mediterranean', 'Other']
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true,
      index: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'USA'
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere'
      }
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[\d\s-]{10,}$/, 'Please provide a valid phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    website: {
      type: String,
      match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please provide a valid URL']
    }
  },
  operatingHours: {
    monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isClosed: { type: Boolean, default: false } }
  },
  pricing: {
    averageCost: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    }
  },
  
  amenities: [{
    type: String,
    enum: ['WiFi', 'Parking', 'Reservations', 'Takeout', 'Delivery', 'Outdoor Seating', 'Bar', 'Vegetarian Options', 'Vegan Options', 'Gluten-Free Options', 'Wheelchair Accessible']
  }],
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
restaurantSchema.index({ name: 'text', description: 'text', 'cuisine': 'text' });
restaurantSchema.index({ 'address.city': 1, rating: -1 });
restaurantSchema.index({ 'address.coordinates': '2dsphere' });

// Pre-save middleware
restaurantSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Virtual for full address
restaurantSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Virtual for menu items
restaurantSchema.virtual('menuItems', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'restaurant'
});

// Virtual for reviews
restaurantSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'restaurant'
});

// Method to check if restaurant is open at given time
restaurantSchema.methods.isOpen = function(day, time) {
  const hours = this.operatingHours[day.toLowerCase()];
  if (hours.isClosed) return false;
  
  const currentTime = time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return currentTime >= hours.open && currentTime <= hours.close;
};


const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
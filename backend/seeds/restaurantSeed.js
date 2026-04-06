const mongoose = require('mongoose');
const path = require('path');
const Restaurant = require('../models/restaurant'); 

require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log("🔄 Connecting to MongoDB...");
console.log("Looking for .env at:", path.join(__dirname, '../config/config.env'));

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
}

// Real restaurant images from Unsplash
const restaurantImages = {
  ethiopian: "https://images.unsplash.com/photo-1547394765-185e1e68f34e",
  italian: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
  chinese: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
  indian: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40",
  mexican: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85",
  japanese: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
  american: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
  thai: "https://images.unsplash.com/photo-1559314809-0d155014e29e",
  french: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
  mediterranean: "https://images.unsplash.com/photo-1543353071-10c8ba85a904",
  vegan: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
  bbq: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba",
  dimsum: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb",
  spanish: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7",
  curry: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0"
};

function getRestaurantImage(restaurantName) {
  const imageMap = {
    "Ethiopian Delight": restaurantImages.ethiopian,
    "Pasta Paradise": restaurantImages.italian,
    "Golden Dragon": restaurantImages.chinese,
    "Spice Route": restaurantImages.indian,
    "Taco Fiesta": restaurantImages.mexican,
    "Sushi Zen": restaurantImages.japanese,
    "Burger Joint": restaurantImages.american,
    "Thai Orchid": restaurantImages.thai,
    "Le Bistro": restaurantImages.french,
    "Mediterranean Grill": restaurantImages.mediterranean,
    "Vegan Haven": restaurantImages.vegan,
    "BBQ Smokehouse": restaurantImages.bbq,
    "Dim Sum Palace": restaurantImages.dimsum,
    "La Cantina": restaurantImages.spanish,
    "Curry House": restaurantImages.curry
  };
  
  return imageMap[restaurantName] || restaurantImages.american;
}

const sampleRestaurants = [
  {
    name: "Ethiopian Delight",
    slug: generateSlug("Ethiopian Delight"),
    description: "Authentic Ethiopian cuisine with traditional flavors and injera bread. Experience the rich cultural heritage of Ethiopia through our carefully prepared dishes.",
    cuisine: ["Ethiopian"],
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-74.006, 40.7128]
      }
    },
    contact: {
      phone: "+1-212-555-0123",
      email: "contact@ethiopiandelight.com",
      website: "https://ethiopiandelight.com"
    },
    operatingHours: {
      monday: { open: "11:00", close: "22:00", isClosed: false },
      tuesday: { open: "11:00", close: "22:00", isClosed: false },
      wednesday: { open: "11:00", close: "22:00", isClosed: false },
      thursday: { open: "11:00", close: "22:00", isClosed: false },
      friday: { open: "11:00", close: "23:00", isClosed: false },
      saturday: { open: "10:00", close: "23:00", isClosed: false },
      sunday: { open: "10:00", close: "21:00", isClosed: false }
    },
    pricing: {
      averageCost: 25,
      currency: "USD"
    },
    amenities: ["WiFi", "Parking", "Takeout", "Vegetarian Options", "Wheelchair Accessible"],
    images: [
      {
        url: getRestaurantImage("Ethiopian Delight"),
        caption: "Traditional Ethiopian dining experience",
        isPrimary: true,
        alt: "Ethiopian restaurant interior"
      }
    ],
    rating: {
      average: 4.5,
      count: 128
    },
    isActive: true,
    isVerified: true
  },
  {
    name: "Pasta Paradise",
    slug: generateSlug("Pasta Paradise"),
    description: "Authentic Italian pasta and wood-fired pizzas made with family recipes passed down for generations.",
    cuisine: ["Italian"],
    address: {
      street: "456 Oak Ave",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-87.6298, 41.8781]
      }
    },
    contact: {
      phone: "+1-312-555-0456",
      email: "info@pastaparadise.com",
      website: "https://pastaparadise.com"
    },
    operatingHours: {
      monday: { open: "17:00", close: "23:00", isClosed: false },
      tuesday: { open: "17:00", close: "23:00", isClosed: false },
      wednesday: { open: "17:00", close: "23:00", isClosed: false },
      thursday: { open: "17:00", close: "23:00", isClosed: false },
      friday: { open: "17:00", close: "00:00", isClosed: false },
      saturday: { open: "12:00", close: "00:00", isClosed: false },
      sunday: { open: "12:00", close: "22:00", isClosed: false }
    },
    pricing: {
      averageCost: 35,
      currency: "USD"
    },
    amenities: ["WiFi", "Reservations", "Bar", "Outdoor Seating", "Vegetarian Options", "Gluten-Free Options"],
    images: [
      {
        url: getRestaurantImage("Pasta Paradise"),
        caption: "Our authentic Italian dining room",
        isPrimary: true,
        alt: "Italian restaurant interior"
      }
    ],
    rating: {
      average: 4.7,
      count: 342
    },
    isActive: true,
    isVerified: true
  },
  {
    name: "Golden Dragon",
    slug: generateSlug("Golden Dragon"),
    description: "Szechuan and Cantonese specialties in an elegant setting with traditional decor.",
    cuisine: ["Chinese"],
    address: {
      street: "789 Broadway",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-122.4194, 37.7749]
      }
    },
    contact: {
      phone: "+1-415-555-0789",
      email: "hello@goldendragon.com",
      website: "https://goldendragon.com"
    },
    operatingHours: {
      monday: { open: "11:30", close: "22:30", isClosed: false },
      tuesday: { open: "11:30", close: "22:30", isClosed: false },
      wednesday: { open: "11:30", close: "22:30", isClosed: false },
      thursday: { open: "11:30", close: "22:30", isClosed: false },
      friday: { open: "11:30", close: "23:30", isClosed: false },
      saturday: { open: "11:30", close: "23:30", isClosed: false },
      sunday: { open: "11:30", close: "22:00", isClosed: false }
    },
    pricing: {
      averageCost: 28,
      currency: "USD"
    },
    amenities: ["WiFi", "Delivery", "Takeout", "Vegetarian Options", "Vegan Options", "Bar"],
    images: [
      {
        url: getRestaurantImage("Golden Dragon"),
        caption: "Elegant Chinese dining experience",
        isPrimary: true,
        alt: "Chinese restaurant interior"
      }
    ],
    rating: {
      average: 4.3,
      count: 215
    },
    isActive: true,
    isVerified: true
  },
  {
    name: "Spice Route",
    slug: generateSlug("Spice Route"),
    description: "Rich and aromatic Indian curries, tandoori dishes, and biryani made with authentic spices.",
    cuisine: ["Indian"],
    address: {
      street: "321 Pine St",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-122.3321, 47.6062]
      }
    },
    contact: {
      phone: "+1-206-555-0321",
      email: "info@spiceroute.com",
      website: null
    },
    operatingHours: {
      monday: { open: "17:00", close: "22:00", isClosed: true },
      tuesday: { open: "17:00", close: "22:00", isClosed: false },
      wednesday: { open: "17:00", close: "22:00", isClosed: false },
      thursday: { open: "17:00", close: "22:00", isClosed: false },
      friday: { open: "17:00", close: "23:00", isClosed: false },
      saturday: { open: "12:00", close: "23:00", isClosed: false },
      sunday: { open: "12:00", close: "21:00", isClosed: false }
    },
    pricing: {
      averageCost: 22,
      currency: "USD"
    },
    amenities: ["Takeout", "Delivery", "Vegetarian Options", "Vegan Options", "Gluten-Free Options"],
    images: [
      {
        url: getRestaurantImage("Spice Route"),
        caption: "Authentic Indian ambiance",
        isPrimary: true,
        alt: "Indian restaurant interior"
      }
    ],
    rating: {
      average: 4.6,
      count: 187
    },
    isActive: true,
    isVerified: false
  },
  {
    name: "Taco Fiesta",
    slug: generateSlug("Taco Fiesta"),
    description: "Authentic Mexican street food with fresh ingredients and bold flavors from Oaxaca.",
    cuisine: ["Mexican"],
    address: {
      street: "567 Cesar Chavez Blvd",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90012",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-118.2437, 34.0522]
      }
    },
    contact: {
      phone: "+1-213-555-0567",
      email: "hola@tacofiesta.com",
      website: "https://tacofiesta.com"
    },
    operatingHours: {
      monday: { open: "10:00", close: "23:00", isClosed: false },
      tuesday: { open: "10:00", close: "23:00", isClosed: false },
      wednesday: { open: "10:00", close: "23:00", isClosed: false },
      thursday: { open: "10:00", close: "23:00", isClosed: false },
      friday: { open: "10:00", close: "02:00", isClosed: false },
      saturday: { open: "09:00", close: "02:00", isClosed: false },
      sunday: { open: "09:00", close: "22:00", isClosed: false }
    },
    pricing: {
      averageCost: 15,
      currency: "USD"
    },
    amenities: ["WiFi", "Parking", "Takeout", "Delivery", "Outdoor Seating", "Bar", "Vegetarian Options"],
    images: [
      {
        url: getRestaurantImage("Taco Fiesta"),
        caption: "Vibrant Mexican restaurant",
        isPrimary: true,
        alt: "Mexican restaurant interior"
      }
    ],
    rating: {
      average: 4.4,
      count: 423
    },
    isActive: true,
    isVerified: true
  },
  {
    name: "Sushi Zen",
    slug: generateSlug("Sushi Zen"),
    description: "Premium sushi and Japanese cuisine with omakase experience from master chefs.",
    cuisine: ["Japanese"],
    address: {
      street: "890 Geary St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94109",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-122.4194, 37.7749]
      }
    },
    contact: {
      phone: "+1-415-555-0890",
      email: "reservations@sushizen.com",
      website: "https://sushizen.com"
    },
    operatingHours: {
      monday: { open: "17:30", close: "22:00", isClosed: true },
      tuesday: { open: "17:30", close: "22:00", isClosed: false },
      wednesday: { open: "17:30", close: "22:00", isClosed: false },
      thursday: { open: "17:30", close: "22:00", isClosed: false },
      friday: { open: "17:30", close: "23:00", isClosed: false },
      saturday: { open: "17:30", close: "23:00", isClosed: false },
      sunday: { open: "17:00", close: "21:30", isClosed: false }
    },
    pricing: {
      averageCost: 65,
      currency: "USD"
    },
    amenities: ["Reservations", "Bar", "Wheelchair Accessible", "Vegetarian Options", "Gluten-Free Options"],
    images: [
      {
        url: getRestaurantImage("Sushi Zen"),
        caption: "Minimalist Japanese dining",
        isPrimary: true,
        alt: "Japanese sushi restaurant"
      }
    ],
    rating: {
      average: 4.8,
      count: 256
    },
    isActive: true,
    isVerified: true
  },
  {
    name: "Burger Joint",
    slug: generateSlug("Burger Joint"),
    description: "Gourmet burgers and craft beer in a casual, modern atmosphere.",
    cuisine: ["American"],
    address: {
      street: "234 Elm St",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-97.7431, 30.2672]
      }
    },
    contact: {
      phone: "+1-512-555-0234",
      email: "info@burgerjoint.com",
      website: "https://burgerjoint.com"
    },
    operatingHours: {
      monday: { open: "11:00", close: "22:00", isClosed: false },
      tuesday: { open: "11:00", close: "22:00", isClosed: false },
      wednesday: { open: "11:00", close: "22:00", isClosed: false },
      thursday: { open: "11:00", close: "22:00", isClosed: false },
      friday: { open: "11:00", close: "00:00", isClosed: false },
      saturday: { open: "10:00", close: "00:00", isClosed: false },
      sunday: { open: "10:00", close: "22:00", isClosed: false }
    },
    pricing: {
      averageCost: 18,
      currency: "USD"
    },
    amenities: ["WiFi", "Parking", "Takeout", "Delivery", "Bar", "Outdoor Seating"],
    images: [
      {
        url: getRestaurantImage("Burger Joint"),
        caption: "Modern burger restaurant",
        isPrimary: true,
        alt: "American burger restaurant"
      }
    ],
    rating: {
      average: 4.2,
      count: 567
    },
    isActive: true,
    isVerified: true
  },
  {
    name: "Thai Orchid",
    slug: generateSlug("Thai Orchid"),
    description: "Authentic Thai cuisine with balanced sweet, sour, and spicy flavors from Bangkok.",
    cuisine: ["Thai"],
    address: {
      street: "678 Hawthorne Blvd",
      city: "Portland",
      state: "OR",
      zipCode: "97205",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-122.6765, 45.5152]
      }
    },
    contact: {
      phone: "+1-503-555-0678",
      email: "hello@thaiorchid.com",
      website: null
    },
    operatingHours: {
      monday: { open: "11:00", close: "21:30", isClosed: false },
      tuesday: { open: "11:00", close: "21:30", isClosed: false },
      wednesday: { open: "11:00", close: "21:30", isClosed: false },
      thursday: { open: "11:00", close: "21:30", isClosed: false },
      friday: { open: "11:00", close: "22:30", isClosed: false },
      saturday: { open: "12:00", close: "22:30", isClosed: false },
      sunday: { open: "12:00", close: "21:00", isClosed: false }
    },
    pricing: {
      averageCost: 20,
      currency: "USD"
    },
    amenities: ["Takeout", "Delivery", "Vegetarian Options", "Vegan Options", "Gluten-Free Options"],
    images: [
      {
        url: getRestaurantImage("Thai Orchid"),
        caption: "Traditional Thai decor",
        isPrimary: true,
        alt: "Thai restaurant interior"
      }
    ],
    rating: {
      average: 4.5,
      count: 189
    },
    isActive: true,
    isVerified: false
  },
  {
    name: "Le Bistro",
    slug: generateSlug("Le Bistro"),
    description: "Classic French cuisine with modern interpretations in an intimate Parisian-style setting.",
    cuisine: ["French"],
    address: {
      street: "1234 Chartres St",
      city: "New Orleans",
      state: "LA",
      zipCode: "70116",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-90.066, 29.958]
      }
    },
    contact: {
      phone: "+1-504-555-1234",
      email: "bonjour@lebistro.com",
      website: "https://lebistro.com"
    },
    operatingHours: {
      monday: { open: "17:00", close: "22:00", isClosed: true },
      tuesday: { open: "17:00", close: "22:00", isClosed: false },
      wednesday: { open: "17:00", close: "22:00", isClosed: false },
      thursday: { open: "17:00", close: "22:00", isClosed: false },
      friday: { open: "17:00", close: "23:00", isClosed: false },
      saturday: { open: "10:00", close: "23:00", isClosed: false },
      sunday: { open: "10:00", close: "21:00", isClosed: false }
    },
    pricing: {
      averageCost: 55,
      currency: "USD"
    },
    amenities: ["Reservations", "Bar", "Outdoor Seating", "Wheelchair Accessible", "Vegetarian Options"],
    images: [
      {
        url: getRestaurantImage("Le Bistro"),
        caption: "Romantic French bistro",
        isPrimary: true,
        alt: "French restaurant interior"
      }
    ],
    rating: {
      average: 4.6,
      count: 134
    },
    isActive: true,
    isVerified: true
  },
  {
    name: "Mediterranean Grill",
    slug: generateSlug("Mediterranean Grill"),
    description: "Fresh Mediterranean dishes with Greek and Lebanese influences, using authentic recipes.",
    cuisine: ["Mediterranean"],
    address: {
      street: "345 Colorado Blvd",
      city: "Denver",
      state: "CO",
      zipCode: "80202",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-104.9903, 39.7392]
      }
    },
    contact: {
      phone: "+1-303-555-0345",
      email: "info@medgrill.com",
      website: "https://medgrill.com"
    },
    operatingHours: {
      monday: { open: "11:00", close: "22:00", isClosed: false },
      tuesday: { open: "11:00", close: "22:00", isClosed: false },
      wednesday: { open: "11:00", close: "22:00", isClosed: false },
      thursday: { open: "11:00", close: "22:00", isClosed: false },
      friday: { open: "11:00", close: "23:00", isClosed: false },
      saturday: { open: "11:00", close: "23:00", isClosed: false },
      sunday: { open: "11:00", close: "21:00", isClosed: false }
    },
    pricing: {
      averageCost: 24,
      currency: "USD"
    },
    amenities: ["WiFi", "Parking", "Takeout", "Vegetarian Options", "Vegan Options", "Gluten-Free Options", "Outdoor Seating"],
    images: [
      {
        url: getRestaurantImage("Mediterranean Grill"),
        caption: "Mediterranean-inspired dining",
        isPrimary: true,
        alt: "Mediterranean restaurant"
      }
    ],
    rating: {
      average: 4.4,
      count: 278
    },
    isActive: true,
    isVerified: true
  },
  {
    name: "Vegan Haven",
    slug: generateSlug("Vegan Haven"),
    description: "Plant-based comfort food that everyone can enjoy, made from organic local ingredients.",
    cuisine: ["Other"],
    address: {
      street: "901 Pearl St",
      city: "Boulder",
      state: "CO",
      zipCode: "80302",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-105.27, 40.015]
      }
    },
    contact: {
      phone: "+1-303-555-0901",
      email: "hello@veganhaven.com",
      website: "https://veganhaven.com"
    },
    operatingHours: {
      monday: { open: "09:00", close: "21:00", isClosed: false },
      tuesday: { open: "09:00", close: "21:00", isClosed: false },
      wednesday: { open: "09:00", close: "21:00", isClosed: false },
      thursday: { open: "09:00", close: "21:00", isClosed: false },
      friday: { open: "09:00", close: "22:00", isClosed: false },
      saturday: { open: "09:00", close: "22:00", isClosed: false },
      sunday: { open: "09:00", close: "20:00", isClosed: false }
    },
    pricing: {
      averageCost: 16,
      currency: "USD"
    },
    amenities: ["WiFi", "Takeout", "Delivery", "Vegetarian Options", "Vegan Options", "Gluten-Free Options", "Outdoor Seating"],
    images: [
      {
        url: getRestaurantImage("Vegan Haven"),
        caption: "Modern vegan restaurant",
        isPrimary: true,
        alt: "Vegan restaurant interior"
      }
    ],
    rating: {
      average: 4.7,
      count: 312
    },
    isActive: true,
    isVerified: true
  },
  {
    name: "BBQ Smokehouse",
    slug: generateSlug("BBQ Smokehouse"),
    description: "Slow-smoked meats with homemade sauces and Southern sides, cooked low and slow.",
    cuisine: ["American"],
    address: {
      street: "456 Commerce St",
      city: "Nashville",
      state: "TN",
      zipCode: "37201",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-86.7816, 36.1627]
      }
    },
    contact: {
      phone: "+1-615-555-0456",
      email: "info@bbqsmokehouse.com",
      website: "https://bbqsmokehouse.com"
    },
    operatingHours: {
      monday: { open: "11:00", close: "21:00", isClosed: false },
      tuesday: { open: "11:00", close: "21:00", isClosed: false },
      wednesday: { open: "11:00", close: "21:00", isClosed: false },
      thursday: { open: "11:00", close: "21:00", isClosed: false },
      friday: { open: "11:00", close: "22:00", isClosed: false },
      saturday: { open: "11:00", close: "22:00", isClosed: false },
      sunday: { open: "11:00", close: "20:00", isClosed: true }
    },
    pricing: {
      averageCost: 22,
      currency: "USD"
    },
    amenities: ["WiFi", "Parking", "Takeout", "Delivery", "Bar", "Outdoor Seating"],
    images: [
      {
        url: getRestaurantImage("BBQ Smokehouse"),
        caption: "Rustic BBQ restaurant",
        isPrimary: true,
        alt: "BBQ restaurant interior"
      }
    ],
    rating: {
      average: 4.5,
      count: 445
    },
    isActive: true,
    isVerified: true
  },
  {
    name: "Dim Sum Palace",
    slug: generateSlug("Dim Sum Palace"),
    description: "Traditional dim sum served from morning until afternoon, made fresh daily.",
    cuisine: ["Chinese"],
    address: {
      street: "789 8th Ave",
      city: "New York",
      state: "NY",
      zipCode: "10019",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-73.987, 40.764]
      }
    },
    contact: {
      phone: "+1-212-555-0789",
      email: "dimsum@palace.com",
      website: null
    },
    operatingHours: {
      monday: { open: "09:00", close: "15:00", isClosed: false },
      tuesday: { open: "09:00", close: "15:00", isClosed: false },
      wednesday: { open: "09:00", close: "15:00", isClosed: false },
      thursday: { open: "09:00", close: "15:00", isClosed: false },
      friday: { open: "09:00", close: "16:00", isClosed: false },
      saturday: { open: "08:00", close: "16:00", isClosed: false },
      sunday: { open: "08:00", close: "15:00", isClosed: false }
    },
    pricing: {
      averageCost: 28,
      currency: "USD"
    },
    amenities: ["Takeout", "Vegetarian Options", "Wheelchair Accessible"],
    images: [
      {
        url: getRestaurantImage("Dim Sum Palace"),
        caption: "Traditional dim sum house",
        isPrimary: true,
        alt: "Dim sum restaurant"
      }
    ],
    rating: {
      average: 4.3,
      count: 156
    },
    isActive: true,
    isVerified: false
  },
  {
    name: "La Cantina",
    slug: generateSlug("La Cantina"),
    description: "Authentic Spanish tapas and paella with live music on weekends.",
    cuisine: ["Mediterranean"],
    address: {
      street: "123 Calle Ocho",
      city: "Miami",
      state: "FL",
      zipCode: "33135",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-80.226, 25.769]
      }
    },
    contact: {
      phone: "+1-305-555-0123",
      email: "info@lacantina.com",
      website: "https://lacantina.com"
    },
    operatingHours: {
      monday: { open: "17:00", close: "23:00", isClosed: false },
      tuesday: { open: "17:00", close: "23:00", isClosed: false },
      wednesday: { open: "17:00", close: "23:00", isClosed: false },
      thursday: { open: "17:00", close: "23:00", isClosed: false },
      friday: { open: "17:00", close: "01:00", isClosed: false },
      saturday: { open: "12:00", close: "01:00", isClosed: false },
      sunday: { open: "12:00", close: "22:00", isClosed: false }
    },
    pricing: {
      averageCost: 32,
      currency: "USD"
    },
    amenities: ["WiFi", "Reservations", "Bar", "Outdoor Seating", "Vegetarian Options"],
    images: [
      {
        url: getRestaurantImage("La Cantina"),
        caption: "Vibrant Spanish tapas bar",
        isPrimary: true,
        alt: "Spanish restaurant interior"
      }
    ],
    rating: {
      average: 4.6,
      count: 234
    },
    isActive: true,
    isVerified: true
  },
  {
    name: "Curry House",
    slug: generateSlug("Curry House"),
    description: "Japanese curry and katsu dishes with comfort food vibes and authentic flavors.",
    cuisine: ["Japanese"],
    address: {
      street: "456 University Way",
      city: "Seattle",
      state: "WA",
      zipCode: "98105",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-122.313, 47.656]
      }
    },
    contact: {
      phone: "+1-206-555-0456",
      email: "curry@house.com",
      website: "https://curryhouse.com"
    },
    operatingHours: {
      monday: { open: "11:30", close: "21:30", isClosed: false },
      tuesday: { open: "11:30", close: "21:30", isClosed: false },
      wednesday: { open: "11:30", close: "21:30", isClosed: false },
      thursday: { open: "11:30", close: "21:30", isClosed: false },
      friday: { open: "11:30", close: "22:30", isClosed: false },
      saturday: { open: "12:00", close: "22:30", isClosed: false },
      sunday: { open: "12:00", close: "21:00", isClosed: false }
    },
    pricing: {
      averageCost: 16,
      currency: "USD"
    },
    amenities: ["Takeout", "Delivery", "Vegetarian Options", "Wheelchair Accessible"],
    images: [
      {
        url: getRestaurantImage("Curry House"),
        caption: "Cozy Japanese curry house",
        isPrimary: true,
        alt: "Japanese curry restaurant"
      }
    ],
    rating: {
      average: 4.4,
      count: 178
    },
    isActive: true,
    isVerified: false
  }
];

async function getExistingUsers() {
  try {
    const User = require('../models/user');
    const users = await User.find().limit(10);
    if (users.length > 0) {
      console.log(`✅ Found ${users.length} existing users to assign as owners`);
      return users.map(user => user._id);
    }
  } catch (error) {
    console.log('ℹ️ No User model found or no users in database, using placeholder ObjectIds');
  }
  return [new mongoose.Types.ObjectId()];
}

async function seedRestaurants(options = { clearExisting: true }) {
  let connection;
  
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined. Please check your config/config.env file.');
    }
    
    connection = await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB database:', connection.connection.name);
    
    const ownerIds = await getExistingUsers();
    console.log(`📋 Using ${ownerIds.length} owner(s) for restaurants`);
    
    const restaurantsWithOwners = sampleRestaurants.map((restaurant, index) => ({
      ...restaurant,
      owner: ownerIds[index % ownerIds.length]
    }));
    
    if (options.clearExisting) {
      const deleteResult = await Restaurant.deleteMany({});
      console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing restaurants`);
    }
    
    const inserted = await Restaurant.insertMany(restaurantsWithOwners, { ordered: false });
    
    console.log(`\n✅ Successfully seeded ${inserted.length} restaurants`);
    
    const cuisineStats = {};
    const cityStats = {};
    const verificationStats = { verified: 0, unverified: 0 };
    
    sampleRestaurants.forEach(rest => {
      rest.cuisine.forEach(c => {
        cuisineStats[c] = (cuisineStats[c] || 0) + 1;
      });
      
      cityStats[rest.address.city] = (cityStats[rest.address.city] || 0) + 1;
      
      if (rest.isVerified) {
        verificationStats.verified++;
      } else {
        verificationStats.unverified++;
      }
    });
    
    console.log('\n📊 Seeding Statistics:');
    console.log('─────────────────────');
    console.log('Restaurants by cuisine:');
    Object.entries(cuisineStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cuisine, count]) => {
        console.log(`  🍽️ ${cuisine}: ${count}`);
      });
    
    console.log('\nRestaurants by city:');
    Object.entries(cityStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([city, count]) => {
        console.log(`  📍 ${city}: ${count}`);
      });
    
    console.log('\nVerification status:');
    console.log(`  ✅ Verified: ${verificationStats.verified}`);
    console.log(`  ⚠️ Unverified: ${verificationStats.unverified}`);
    
    if (inserted.length > 0) {
      console.log('\n📝 Sample restaurant:');
      console.log(`  Name: ${inserted[0].name}`);
      console.log(`  Slug: ${inserted[0].slug}`);
      console.log(`  Cuisine: ${inserted[0].cuisine.join(', ')}`);
      console.log(`  City: ${inserted[0].address.city}`);
      console.log(`  Rating: ${inserted[0].rating.average} ⭐ (${inserted[0].rating.count} reviews)`);
      console.log(`  Price Range: $${inserted[0].pricing.averageCost}`);
      console.log(`  Image: ${inserted[0].images[0].url}`);
    }
    
    return inserted;
    
  } catch (error) {
    console.error('❌ Error seeding restaurants:', error);
    
    if (error.code === 11000) {
      console.error('Duplicate key error - likely duplicate restaurant name or slug');
      console.error('Please check for duplicate names in your data');
    } else if (error.name === 'ValidationError') {
      console.error('Validation error - check your data against the schema');
      console.error(error.message);
    }
    
    throw error;
    
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

console.log('Starting restaurant seeding with real images...');
seedRestaurants().catch(console.error);
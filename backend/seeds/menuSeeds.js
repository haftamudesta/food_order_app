const mongoose = require('mongoose');
const path = require('path');
const Menu = require('../models/menu');
const Restaurant = require('../models/restaurant');
const FoodItem = require('../models/foodItem');

require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log("🔄 Connecting to MongoDB...");
console.log("Looking for .env at:", path.join(__dirname, '../config/config.env'));

const menuCategories = {
  "Ethiopian Delight": {
    categories: [
      {
        name: "Main Dishes",
        items: ["Doro Wat", "Kitfo", "Tibs", "Shiro Wat"]
      },
      {
        name: "Vegetarian",
        items: ["Vegetarian Combo", "Shiro Wat"]
      },
      {
        name: "Appetizers",
        items: ["Sambusa"]
      }
    ]
  },

  "Pasta Paradise": {
    categories: [
      {
        name: "Pasta",
        items: ["Spaghetti Carbonara", "Fettuccine Alfredo", "Lasagna Bolognese"]
      },
      {
        name: "Pizza",
        items: ["Margherita Pizza"]
      },
      {
        name: "Desserts",
        items: ["Tiramisu"]
      }
    ]
  },

  "Golden Dragon": {
    categories: [
      {
        name: "Main Courses",
        items: ["Kung Pao Chicken", "Peking Duck", "Mapo Tofu"]
      },
      {
        name: "Dim Sum",
        items: ["Dim Sum Platter"]
      },
      {
        name: "Rice & Noodles",
        items: ["Fried Rice"]
      }
    ]
  },

  "Spice Route": {
    categories: [
      {
        name: "Curries",
        items: ["Butter Chicken", "Chicken Tikka Masala"]
      },
      {
        name: "Rice Dishes",
        items: ["Chicken Biryani"]
      },
      {
        name: "Breads",
        items: ["Garlic Naan"]
      },
      {
        name: "Appetizers",
        items: ["Vegetable Samosa"]
      }
    ]
  },

  "Taco Fiesta": {
    categories: [
      {
        name: "Tacos",
        items: ["Street Tacos"]
      },
      {
        name: "Bowls & Burritos",
        items: ["Burrito Bowl", "Quesadilla"]
      },
      {
        name: "Desserts",
        items: ["Churros"]
      }
    ]
  },

  "Sushi Zen": {
    categories: [
      {
        name: "Sushi Rolls",
        items: ["Rainbow Roll", "Spicy Tuna Roll"]
      },
      {
        name: "Sashimi",
        items: ["Sashimi Platter", "Omakase"]
      },
      {
        name: "Soups",
        items: ["Miso Soup"]
      }
    ]
  },

  "Burger Joint": {
    categories: [
      {
        name: "Burgers",
        items: ["Classic Cheeseburger", "Double Bacon Burger", "Veggie Burger"]
      },
      {
        name: "Sides",
        items: ["Sweet Potato Fries"]
      },
      {
        name: "Beverages",
        items: ["Milkshake"]
      }
    ]
  },

  "Thai Orchid": {
    categories: [
      {
        name: "Noodles",
        items: ["Pad Thai"]
      },
      {
        name: "Curries",
        items: ["Green Curry"]
      },
      {
        name: "Soups",
        items: ["Tom Yum Soup"]
      },
      {
        name: "Desserts",
        items: ["Mango Sticky Rice"]
      }
    ]
  },

  "Le Bistro": {
    categories: [
      {
        name: "Main Courses",
        items: ["Coq au Vin", "Beef Bourguignon"]
      },
      {
        name: "Appetizers",
        items: ["Escargot"]
      },
      {
        name: "Desserts",
        items: ["Crème Brûlée"]
      }
    ]
  },

  "Mediterranean Grill": {
    categories: [
      {
        name: "Platters",
        items: ["Gyro Platter"]
      },
      {
        name: "Wraps",
        items: ["Falafel Wrap"]
      },
      {
        name: "Appetizers",
        items: ["Hummus"]
      },
      {
        name: "Desserts",
        items: ["Baklava"]
      }
    ]
  },

  "Vegan Haven": {
    categories: [
      {
        name: "Bowls",
        items: ["Buddha Bowl"]
      },
      {
        name: "Burgers",
        items: ["Beyond Burger"]
      },
      {
        name: "Tacos",
        items: ["Jackfruit Tacos"]
      },
      {
        name: "Desserts",
        items: ["Vegan Cheesecake"]
      }
    ]
  },

  "BBQ Smokehouse": {
    categories: [
      {
        name: "BBQ Meats",
        items: ["St. Louis Ribs", "Brisket Platter", "Pulled Pork Sandwich"]
      },
      {
        name: "Sides",
        items: ["Mac and Cheese"]
      }
    ]
  },

  "Dim Sum Palace": {
    categories: [
      {
        name: "Steamed Dumplings",
        items: ["Har Gow", "Siu Mai", "Char Siu Bao"]
      },
      {
        name: "Baked Goods",
        items: ["Egg Tarts"]
      }
    ]
  },

  "La Cantina": {
    categories: [
      {
        name: "Rice Dishes",
        items: ["Paella Valenciana"]
      },
      {
        name: "Tapas",
        items: ["Patatas Bravas", "Gambas al Ajillo"]
      },
      {
        name: "Desserts",
        items: ["Churros con Chocolate"]
      }
    ]
  },

  "Curry House": {
    categories: [
      {
        name: "Curry Dishes",
        items: ["Chicken Katsu Curry", "Vegetable Curry"]
      },
      {
        name: "Ramen",
        items: ["Tonkotsu Ramen"]
      },
      {
        name: "Snacks",
        items: ["Takoyaki"]
      }
    ]
  }
};

async function getRestaurants() {
  try {
    const restaurants = await Restaurant.find({});
    if (restaurants.length === 0) {
      throw new Error('No restaurants found. Please run restaurant seed first.');
    }
    console.log(`✅ Found ${restaurants.length} restaurants`);
    return restaurants;
  } catch (error) {
    console.error('❌ Error fetching restaurants:', error.message);
    throw error;
  }
}

async function getFoodItemsByNames(restaurantId, itemNames) {
  try {
    const foodItems = await FoodItem.find({
      restaurant: restaurantId,
      name: { $in: itemNames }
    });
    
    const itemMap = {};
    foodItems.forEach(item => {
      itemMap[item.name] = item._id;
    });
    
    return itemMap;
  } catch (error) {
    console.error('❌ Error fetching food items:', error.message);
    throw error;
  }
}

async function seedMenus(options = { clearExisting: true }) {
  let connection;
  
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined. Please check your config/config.env file.');
    }
    
    connection = await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB database:', connection.connection.name);
    
    const restaurants = await getRestaurants();
    
    const restaurantMap = {};
    restaurants.forEach(restaurant => {
      restaurantMap[restaurant.name] = restaurant._id;
    });
    
    if (options.clearExisting) {
      const deleteResult = await Menu.deleteMany({});
      console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing menus`);
    }
    
    const allMenus = [];
    let successfulMenus = 0;
    let failedMenus = 0;
    
    for (const [restaurantName, menuData] of Object.entries(menuCategories)) {
      const restaurantId = restaurantMap[restaurantName];
      
      if (!restaurantId) {
        console.warn(`⚠️ Restaurant "${restaurantName}" not found in database. Skipping...`);
        failedMenus++;
        continue;
      }
      
      console.log(`\n📋 Building menu for ${restaurantName}...`);
      
     
      const allItemNames = menuData.categories.flatMap(cat => cat.items);
      const itemMap = await getFoodItemsByNames(restaurantId, allItemNames);
      
      const menuCategoriesArray = [];
      let missingItems = [];
      
      for (const category of menuData.categories) {
        const categoryItems = [];
        
        for (const itemName of category.items) {
          const itemId = itemMap[itemName];
          if (itemId) {
            categoryItems.push(itemId);
          } else {
            missingItems.push(itemName);
          }
        }
        
        if (categoryItems.length > 0) {
          menuCategoriesArray.push({
            category: category.name,
            items: categoryItems
          });
        }
      }
      
      if (missingItems.length > 0) {
        console.warn(`  ⚠️ Missing ${missingItems.length} items: ${missingItems.join(', ')}`);
      }
      
      if (menuCategoriesArray.length === 0) {
        console.warn(`  ⚠️ No valid categories found for ${restaurantName}. Skipping...`);
        failedMenus++;
        continue;
      }
      
      allMenus.push({
        restaurant: restaurantId,
        menu: menuCategoriesArray
      });
      
      console.log(`  ✅ Created ${menuCategoriesArray.length} categories with ${menuCategoriesArray.reduce((sum, cat) => sum + cat.items.length, 0)} items`);
      successfulMenus++;
    }
    
    console.log(`\n📊 Total menus to create: ${allMenus.length}`);
    
    if (allMenus.length === 0) {
      console.log('⚠️ No menus to create. Please ensure restaurants and food items are seeded first.');
      return [];
    }
    
    let inserted = [];
    
    try {
      inserted = await Menu.insertMany(allMenus, { ordered: false });
      console.log(`\n✅ Successfully created ${inserted.length} menus`);
    } catch (insertError) {
      console.error('❌ Error inserting menus:', insertError.message);
      const existingMenus = await Menu.find({});
      inserted = existingMenus;
      console.log(`📊 Found ${inserted.length} existing menus in database`);
    }
    
    console.log('\n📊 Seeding Statistics:');
    console.log('─────────────────────');
    console.log(`Successful Menus: ${successfulMenus}`);
    console.log(`Failed Menus: ${failedMenus}`);
    console.log(`Total Categories: ${inserted.reduce((sum, menu) => sum + menu.menu.length, 0)}`);
    console.log(`Total Menu Items: ${inserted.reduce((sum, menu) => sum + menu.menu.reduce((s, cat) => s + cat.items.length, 0), 0)}`);
    
    if (inserted.length > 0) {
      console.log('\n📝 Sample Menu:');
      const sampleMenu = inserted[0];
      const restaurant = restaurants.find(r => r._id.equals(sampleMenu.restaurant));
      console.log(`  Restaurant: ${restaurant?.name || 'Unknown'}`);
      console.log('  Categories:');
      sampleMenu.menu.forEach(category => {
        console.log(`    📁 ${category.category}: ${category.items.length} items`);
      });
    }
    
    return inserted;
    
  } catch (error) {
    console.error('❌ Error seeding menus:', error);
    
    if (error.code === 11000) {
      console.error('Duplicate key error - likely duplicate menu for restaurant');
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

// Run the seed
console.log('📋 Starting menu seeding...');
console.log('⚠️ Make sure you have seeded restaurants and food items first!\n');

seedMenus().catch(console.error);
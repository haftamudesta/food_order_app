const mongoose = require('mongoose');
const path = require('path');
const FoodItem = require('../models/foodItem');
const Restaurant = require('../models/restaurant');
const User = require('../models/user');

require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log("🔄 Connecting to MongoDB...");
console.log("Looking for .env at:", path.join(__dirname, '../config/config.env'));

function generateSlug(name, restaurantName) {
  const slugName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slugRestaurant = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slugRestaurant}-${slugName}`;
}

const foodItemsData = {
  "Ethiopian Delight": [
    {
      name: "Doro Wat",
      description: "Spicy chicken stew with berbere spice, served with injera. A traditional Ethiopian favorite.",
      price: 18.99,
      servingSize: "1 plate with injera",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1585936539182-37b8e5a4da01", caption: "Traditional Doro Wat", isPrimary: true, alt: "Doro Wat chicken stew" }]
    },
    {
      name: "Kitfo",
      description: "Minced raw beef seasoned with mitmita and cardamom, served with cottage cheese and greens.",
      price: 16.99,
      servingSize: "250g",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1585936539182-37b8e5a4da02", caption: "Authentic Kitfo", isPrimary: true, alt: "Kitfo beef dish" }]
    },
    {
      name: "Tibs",
      description: "Sautéed beef or lamb with onions, peppers, and Ethiopian spices.",
      price: 17.99,
      servingSize: "1 plate",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1585936539182-37b8e5a4da03", caption: "Sizzling Tibs", isPrimary: true, alt: "Tibs meat dish" }]
    },
    {
      name: "Vegetarian Combo",
      description: "Assorted vegetarian dishes including misir wat (lentils), gomen (collard greens), and atakilt wat (cabbage).",
      price: 14.99,
      servingSize: "Large platter with injera",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1585936539182-37b8e5a4da04", caption: "Vegetarian Feast", isPrimary: true, alt: "Vegetarian combo platter" }]
    },
    {
      name: "Sambusa",
      description: "Crispy pastry filled with spiced lentils or ground beef.",
      price: 5.99,
      servingSize: "2 pieces",
      images: [{ url: "https://images.unsplash.com/photo-1585936539182-37b8e5a4da05", caption: "Crispy Sambusa", isPrimary: true, alt: "Sambusa appetizer" }]
    },
    {
      name: "Shiro Wat",
      description: "Chickpea stew with berbere and niter kibbeh (spiced clarified butter).",
      price: 12.99,
      servingSize: "1 bowl",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1585936539182-37b8e5a4da06", caption: "Shiro Wat", isPrimary: true, alt: "Shiro Wat stew" }]
    }
  ],

  "Pasta Paradise": [
    {
      name: "Spaghetti Carbonara",
      description: "Creamy sauce with crispy pancetta, fresh egg, and pecorino cheese.",
      price: 18.99,
      servingSize: "1 plate",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1612874742237-6526221588e3", caption: "Classic Carbonara", isPrimary: true, alt: "Spaghetti Carbonara" }]
    },
    {
      name: "Fettuccine Alfredo",
      description: "Rich creamy sauce with parmesan cheese and fresh parsley.",
      price: 16.99,
      servingSize: "1 plate",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1645112411341-61e6fa1569c2", caption: "Creamy Alfredo", isPrimary: true, alt: "Fettuccine Alfredo" }]
    },
    {
      name: "Margherita Pizza",
      description: "San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil.",
      price: 14.99,
      servingSize: "12 inches",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca", caption: "Classic Margherita", isPrimary: true, alt: "Margherita Pizza" }]
    },
    {
      name: "Lasagna Bolognese",
      description: "Layers of fresh pasta, meat sauce, béchamel, and parmesan cheese.",
      price: 19.99,
      servingSize: "1 portion",
      isPopular: true,
      discount: 10,
      discountStartDate: new Date(),
      discountEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      images: [{ url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3", caption: "Hearty Lasagna", isPrimary: true, alt: "Lasagna Bolognese" }]
    },
    {
      name: "Tiramisu",
      description: "Coffee-soaked ladyfingers layered with mascarpone cream and cocoa.",
      price: 8.99,
      servingSize: "1 slice",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9", caption: "Delicious Tiramisu", isPrimary: true, alt: "Tiramisu dessert" }]
    }
  ],

  "Golden Dragon": [
    {
      name: "Kung Pao Chicken",
      description: "Spicy stir-fry with chicken, peanuts, bell peppers, and Sichuan peppercorns.",
      price: 16.99,
      servingSize: "1 plate",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1525755662778-989d0524087e", caption: "Kung Pao Chicken", isPrimary: true, alt: "Kung Pao Chicken" }]
    },
    {
      name: "Dim Sum Platter",
      description: "Assorted dumplings including shrimp har gow, pork siu mai, and vegetable dumplings.",
      price: 12.99,
      servingSize: "8 pieces",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb", caption: "Dim Sum Selection", isPrimary: true, alt: "Dim Sum platter" }]
    },
    {
      name: "Peking Duck",
      description: "Crispy roasted duck served with pancakes, hoisin sauce, and scallions.",
      price: 32.99,
      servingSize: "Half duck",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1611076655279-46e7e23df41b", caption: "Peking Duck", isPrimary: true, alt: "Peking Duck" }]
    },
    {
      name: "Mapo Tofu",
      description: "Spicy tofu with minced pork and fermented bean paste.",
      price: 14.99,
      servingSize: "1 bowl",
      images: [{ url: "https://images.unsplash.com/photo-1593625636289-6cf89f1a18e0", caption: "Mapo Tofu", isPrimary: true, alt: "Mapo Tofu" }]
    },
    {
      name: "Fried Rice",
      description: "Wok-tossed rice with eggs, peas, carrots, and choice of chicken, pork, or shrimp.",
      price: 11.99,
      servingSize: "1 plate",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1512058564366-18510be2db19", caption: "Special Fried Rice", isPrimary: true, alt: "Fried Rice" }]
    }
  ],

  "Spice Route": [
    {
      name: "Butter Chicken",
      description: "Creamy tomato-based curry with tender tandoori chicken pieces.",
      price: 17.99,
      servingSize: "1 bowl with rice",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398", caption: "Butter Chicken", isPrimary: true, alt: "Butter Chicken curry" }]
    },
    {
      name: "Chicken Biryani",
      description: "Aromatic basmati rice with spiced chicken, saffron, and caramelized onions.",
      price: 16.99,
      servingSize: "1 plate with raita",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0", caption: "Chicken Biryani", isPrimary: true, alt: "Chicken Biryani" }]
    },
    {
      name: "Garlic Naan",
      description: "Freshly baked flatbread with garlic and butter.",
      price: 3.99,
      servingSize: "1 piece",
      images: [{ url: "https://images.unsplash.com/photo-1604909052743-94e838986d24", caption: "Garlic Naan", isPrimary: true, alt: "Garlic Naan bread" }]
    },
    {
      name: "Chicken Tikka Masala",
      description: "Grilled chicken in creamy spiced tomato sauce.",
      price: 18.99,
      servingSize: "1 bowl with rice",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1565557623262-b5d642afff1d", caption: "Chicken Tikka Masala", isPrimary: true, alt: "Chicken Tikka Masala" }]
    },
    {
      name: "Vegetable Samosa",
      description: "Crispy pastry filled with spiced potatoes and peas.",
      price: 5.99,
      servingSize: "2 pieces",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1601050690597-df0568f70950", caption: "Vegetable Samosa", isPrimary: true, alt: "Samosa appetizer" }]
    }
  ],

  "Taco Fiesta": [
    {
      name: "Street Tacos",
      description: "Three corn tortillas with choice of meat, onion, cilantro, and salsa.",
      price: 9.99,
      servingSize: "3 tacos",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b", caption: "Street Tacos", isPrimary: true, alt: "Street Tacos" }]
    },
    {
      name: "Burrito Bowl",
      description: "Rice, beans, choice of meat, salsa, guacamole, and cheese.",
      price: 12.99,
      servingSize: "1 bowl",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f", caption: "Burrito Bowl", isPrimary: true, alt: "Burrito Bowl" }]
    },
    {
      name: "Quesadilla",
      description: "Grilled flour tortilla filled with cheese and choice of meat.",
      price: 10.99,
      servingSize: "1 large quesadilla",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f", caption: "Cheesy Quesadilla", isPrimary: true, alt: "Quesadilla" }]
    },
    {
      name: "Churros",
      description: "Fried dough with cinnamon sugar and chocolate dipping sauce.",
      price: 6.99,
      servingSize: "4 pieces",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80", caption: "Sweet Churros", isPrimary: true, alt: "Churros dessert" }]
    }
  ],

  "Sushi Zen": [
    {
      name: "Omakase",
      description: "Chef's selection of premium sushi and sashimi, seasonal and fresh.",
      price: 65.99,
      servingSize: "12 pieces",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c", caption: "Omakase Experience", isPrimary: true, alt: "Omakase sushi" }]
    },
    {
      name: "Rainbow Roll",
      description: "California roll topped with assorted sashimi including tuna, salmon, and avocado.",
      price: 16.99,
      servingSize: "8 pieces",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56", caption: "Rainbow Roll", isPrimary: true, alt: "Rainbow Roll sushi" }]
    },
    {
      name: "Spicy Tuna Roll",
      description: "Fresh tuna with spicy mayo and cucumber inside out roll.",
      price: 12.99,
      servingSize: "8 pieces",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db", caption: "Spicy Tuna Roll", isPrimary: true, alt: "Spicy Tuna Roll" }]
    },
    {
      name: "Sashimi Platter",
      description: "Assorted fresh fish slices including tuna, salmon, yellowtail, and octopus.",
      price: 28.99,
      servingSize: "15 pieces",
      images: [{ url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351", caption: "Sashimi Platter", isPrimary: true, alt: "Sashimi platter" }]
    },
    {
      name: "Miso Soup",
      description: "Traditional Japanese soup with tofu, wakame seaweed, and scallions.",
      price: 3.99,
      servingSize: "1 bowl",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1585032226651-759b368d7246", caption: "Miso Soup", isPrimary: true, alt: "Miso Soup" }]
    }
  ],

  "Burger Joint": [
    {
      name: "Classic Cheeseburger",
      description: "Angus beef patty, cheddar cheese, lettuce, tomato, pickles, and special sauce.",
      price: 12.99,
      servingSize: "1 burger with fries",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", caption: "Classic Cheeseburger", isPrimary: true, alt: "Cheeseburger" }]
    },
    {
      name: "Double Bacon Burger",
      description: "Two beef patties, crispy bacon, cheddar cheese, caramelized onions, and BBQ sauce.",
      price: 16.99,
      servingSize: "1 burger with fries",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1553979459-d2229ba7434b", caption: "Double Bacon Burger", isPrimary: true, alt: "Bacon Burger" }]
    },
    {
      name: "Veggie Burger",
      description: "Black bean patty, avocado, lettuce, tomato, red onion, and vegan aioli.",
      price: 13.99,
      servingSize: "1 burger with fries",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1585238342024-78d387f4a707", caption: "Veggie Burger", isPrimary: true, alt: "Veggie Burger" }]
    },
    {
      name: "Sweet Potato Fries",
      description: "Crispy sweet potato fries served with chipotle mayo.",
      price: 5.99,
      servingSize: "1 serving",
      images: [{ url: "https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf", caption: "Sweet Potato Fries", isPrimary: true, alt: "Sweet Potato Fries" }]
    },
    {
      name: "Milkshake",
      description: "Creamy milkshake available in vanilla, chocolate, or strawberry.",
      price: 6.99,
      servingSize: "16 oz",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699", caption: "Thick Milkshake", isPrimary: true, alt: "Milkshake" }]
    }
  ],

  "Thai Orchid": [
    {
      name: "Pad Thai",
      description: "Stir-fried rice noodles with egg, tofu, bean sprouts, peanuts, and choice of protein.",
      price: 14.99,
      servingSize: "1 plate",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881", caption: "Pad Thai", isPrimary: true, alt: "Pad Thai" }]
    },
    {
      name: "Green Curry",
      description: "Coconut curry with bamboo shoots, bell peppers, Thai basil, and choice of protein.",
      price: 15.99,
      servingSize: "1 bowl with rice",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd", caption: "Green Curry", isPrimary: true, alt: "Green Curry" }]
    },
    {
      name: "Tom Yum Soup",
      description: "Hot and sour soup with lemongrass, kaffir lime leaves, mushrooms, and shrimp.",
      price: 8.99,
      servingSize: "1 bowl",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1547592166-23ac45744acd", caption: "Tom Yum Soup", isPrimary: true, alt: "Tom Yum Soup" }]
    },
    {
      name: "Mango Sticky Rice",
      description: "Sweet sticky rice with fresh mango and coconut milk topping.",
      price: 7.99,
      servingSize: "1 serving",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1605440566364-e2a7a6b5ac0c", caption: "Mango Sticky Rice", isPrimary: true, alt: "Mango Sticky Rice dessert" }]
    }
  ],

  "Le Bistro": [
    {
      name: "Coq au Vin",
      description: "Chicken braised in red wine with mushrooms, bacon, and pearl onions.",
      price: 24.99,
      servingSize: "1 plate",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092", caption: "Coq au Vin", isPrimary: true, alt: "Coq au Vin" }]
    },
    {
      name: "Beef Bourguignon",
      description: "Slow-cooked beef in red wine sauce with carrots, mushrooms, and pearl onions.",
      price: 26.99,
      servingSize: "1 plate",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1600891964092-4316c288032e", caption: "Beef Bourguignon", isPrimary: true, alt: "Beef Bourguignon" }]
    },
    {
      name: "Escargot",
      description: "Snails in garlic herb butter and parsley, baked to perfection.",
      price: 12.99,
      servingSize: "6 pieces",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd", caption: "Escargot", isPrimary: true, alt: "Escargot appetizer" }]
    },
    {
      name: "Crème Brûlée",
      description: "Rich vanilla custard with caramelized sugar crust.",
      price: 8.99,
      servingSize: "1 ramekin",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc", caption: "Crème Brûlée", isPrimary: true, alt: "Crème Brûlée dessert" }]
    }
  ],

  "Mediterranean Grill": [
    {
      name: "Gyro Platter",
      description: "Seasoned lamb and beef with tzatziki sauce, rice pilaf, and Greek salad.",
      price: 16.99,
      servingSize: "1 platter",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1585936539182-37b8e5a4da01", caption: "Gyro Platter", isPrimary: true, alt: "Gyro platter" }]
    },
    {
      name: "Falafel Wrap",
      description: "Crispy chickpea fritters with tahini sauce, lettuce, tomato, and pickles.",
      price: 11.99,
      servingSize: "1 wrap",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1593001874117-c99c800e2df7", caption: "Falafel Wrap", isPrimary: true, alt: "Falafel wrap" }]
    },
    {
      name: "Hummus",
      description: "Creamy chickpea dip with olive oil, paprika, and pine nuts.",
      price: 6.99,
      servingSize: "1 bowl with pita",
      images: [{ url: "https://images.unsplash.com/photo-1593001874117-c99c800e2df7", caption: "Hummus", isPrimary: true, alt: "Hummus dip" }]
    },
    {
      name: "Baklava",
      description: "Sweet pastry with walnuts and honey syrup.",
      price: 5.99,
      servingSize: "2 pieces",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1516812577565-f9b8ee6e5b4e", caption: "Baklava", isPrimary: true, alt: "Baklava dessert" }]
    }
  ],

  "Vegan Haven": [
    {
      name: "Buddha Bowl",
      description: "Quinoa, roasted vegetables, avocado, chickpeas, and tahini dressing.",
      price: 14.99,
      servingSize: "1 bowl",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", caption: "Buddha Bowl", isPrimary: true, alt: "Buddha Bowl" }]
    },
    {
      name: "Beyond Burger",
      description: "Plant-based patty with vegan cheese, lettuce, tomato, and special sauce.",
      price: 15.99,
      servingSize: "1 burger with fries",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1585238342024-78d387f4a707", caption: "Beyond Burger", isPrimary: true, alt: "Beyond Burger" }]
    },
    {
      name: "Jackfruit Tacos",
      description: "Pulled jackfruit with cabbage slaw, avocado crema, and salsa.",
      price: 12.99,
      servingSize: "3 tacos",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b", caption: "Jackfruit Tacos", isPrimary: true, alt: "Jackfruit tacos" }]
    },
    {
      name: "Vegan Cheesecake",
      description: "Cashew-based cheesecake with berry compote.",
      price: 7.99,
      servingSize: "1 slice",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1533134242443-d4fd45e47556", caption: "Vegan Cheesecake", isPrimary: true, alt: "Vegan cheesecake" }]
    }
  ],

  "BBQ Smokehouse": [
    {
      name: "St. Louis Ribs",
      description: "Slow-smoked pork ribs with house BBQ sauce, served with coleslaw and cornbread.",
      price: 24.99,
      servingSize: "Half rack",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1544025162-d76694265947", caption: "St. Louis Ribs", isPrimary: true, alt: "BBQ ribs" }]
    },
    {
      name: "Brisket Platter",
      description: "Smoked beef brisket with pickles, onions, and Texas toast.",
      price: 22.99,
      servingSize: "1/2 lb",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659", caption: "Smoked Brisket", isPrimary: true, alt: "Beef brisket" }]
    },
    {
      name: "Pulled Pork Sandwich",
      description: "Smoked pork with coleslaw and BBQ sauce on a brioche bun.",
      price: 13.99,
      servingSize: "1 sandwich",
      images: [{ url: "https://images.unsplash.com/photo-1582487296449-60b6c7c6bcba", caption: "Pulled Pork", isPrimary: true, alt: "Pulled pork sandwich" }]
    },
    {
      name: "Mac and Cheese",
      description: "Creamy macaroni with three cheeses and breadcrumb topping.",
      price: 6.99,
      servingSize: "1 side",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1543339308-43e59d6b73a5", caption: "Mac and Cheese", isPrimary: true, alt: "Mac and cheese" }]
    }
  ],

  "Dim Sum Palace": [
    {
      name: "Har Gow",
      description: "Steamed shrimp dumplings with bamboo shoots, translucent wrapper.",
      price: 6.99,
      servingSize: "4 pieces",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb", caption: "Har Gow", isPrimary: true, alt: "Shrimp dumplings" }]
    },
    {
      name: "Siu Mai",
      description: "Open-topped pork and shrimp dumplings with mushroom.",
      price: 6.99,
      servingSize: "4 pieces",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb", caption: "Siu Mai", isPrimary: true, alt: "Pork dumplings" }]
    },
    {
      name: "Char Siu Bao",
      description: "Steamed BBQ pork buns, soft and fluffy.",
      price: 5.99,
      servingSize: "3 pieces",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1563245372-f21724e3856d", caption: "Char Siu Bao", isPrimary: true, alt: "BBQ pork buns" }]
    },
    {
      name: "Egg Tarts",
      description: "Flaky pastry with silky egg custard filling.",
      price: 4.99,
      servingSize: "3 pieces",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1551024506-0bccd828d307", caption: "Egg Tarts", isPrimary: true, alt: "Egg tarts" }]
    }
  ],

  "La Cantina": [
    {
      name: "Paella Valenciana",
      description: "Saffron rice with chicken, rabbit, green beans, and snails (traditional style).",
      price: 28.99,
      servingSize: "2 servings",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1515443961218-a51367888e4b", caption: "Paella Valenciana", isPrimary: true, alt: "Spanish paella" }]
    },
    {
      name: "Patatas Bravas",
      description: "Crispy potatoes with spicy tomato sauce and garlic aioli.",
      price: 7.99,
      servingSize: "1 plate",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1585668950975-9f0b8e2bf4c8", caption: "Patatas Bravas", isPrimary: true, alt: "Patatas bravas" }]
    },
    {
      name: "Gambas al Ajillo",
      description: "Garlic shrimp in olive oil with chili and parsley.",
      price: 12.99,
      servingSize: "1 plate",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1625938144755-6b71e6b0b43c", caption: "Garlic Shrimp", isPrimary: true, alt: "Garlic shrimp" }]
    },
    {
      name: "Churros con Chocolate",
      description: "Fried dough with thick hot chocolate for dipping.",
      price: 7.99,
      servingSize: "6 pieces",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80", caption: "Churros", isPrimary: true, alt: "Churros dessert" }]
    }
  ],

  "Curry House": [
    {
      name: "Chicken Katsu Curry",
      description: "Crispy breaded chicken with Japanese curry rice and pickled vegetables.",
      price: 14.99,
      servingSize: "1 plate",
      isPopular: true,
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0", caption: "Chicken Katsu Curry", isPrimary: true, alt: "Chicken katsu curry" }]
    },
    {
      name: "Tonkotsu Ramen",
      description: "Pork bone broth with chashu pork, soft-boiled egg, bamboo shoots, and noodles.",
      price: 15.99,
      servingSize: "1 bowl",
      isPopular: true,
      images: [{ url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624", caption: "Tonkotsu Ramen", isPrimary: true, alt: "Tonkotsu ramen" }]
    },
    {
      name: "Vegetable Curry",
      description: "Mild curry with seasonal vegetables served with rice.",
      price: 12.99,
      servingSize: "1 plate",
      isRecommended: true,
      images: [{ url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0", caption: "Vegetable Curry", isPrimary: true, alt: "Vegetable curry" }]
    },
    {
      name: "Takoyaki",
      description: "Octopus balls topped with takoyaki sauce, mayo, and bonito flakes.",
      price: 6.99,
      servingSize: "6 pieces",
      isNew: true,
      images: [{ url: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56", caption: "Takoyaki", isPrimary: true, alt: "Takoyaki" }]
    }
  ]
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

async function getUsers() {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      console.log('⚠️ No users found. Using placeholder ObjectIds for createdBy/updatedBy');
      return [new mongoose.Types.ObjectId()];
    }
    console.log(`✅ Found ${users.length} users`);
    return users;
  } catch (error) {
    console.log('⚠️ User model error. Using placeholder ObjectIds');
    return [new mongoose.Types.ObjectId()];
  }
}

async function seedFoodItems(options = { clearExisting: true }) {
  let connection;
  
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined. Please check your config/config.env file.');
    }
    
    connection = await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB database:', connection.connection.name);
    
    const restaurants = await getRestaurants();
    const users = await getUsers();
    
    const restaurantMap = {};
    restaurants.forEach(restaurant => {
      restaurantMap[restaurant.name] = restaurant._id;
    });
    
    if (options.clearExisting) {
      const deleteResult = await FoodItem.deleteMany({});
      console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing food items`);
    }
    
    const allFoodItems = [];
    let totalItems = 0;
    
    for (const [restaurantName, items] of Object.entries(foodItemsData)) {
      const restaurantId = restaurantMap[restaurantName];
      
      if (!restaurantId) {
        console.warn(`⚠️ Restaurant "${restaurantName}" not found in database. Skipping...`);
        continue;
      }
      
      console.log(`📦 Preparing ${items.length} items for ${restaurantName}...`);
      
      items.forEach((item, index) => {
        const userId = users[totalItems % users.length]._id || users[0];
        
        allFoodItems.push({
          ...item,
          restaurant: restaurantId,
          createdBy: userId,
          updatedBy: userId,
          slug: generateSlug(item.name, restaurantName), // Generate unique slug
          orderCount: Math.floor(Math.random() * 500), 
          isAvailable: Math.random() > 0.1, 
          ...(item.discount && {
            discountStartDate: item.discountStartDate || new Date(),
            discountEndDate: item.discountEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })
        });
        totalItems++;
      });
    }
    
    console.log(`\n📊 Total food items to seed: ${allFoodItems.length}`);
    
    const BATCH_SIZE = 50;
    let inserted = [];
    let failed = 0;
    
    for (let i = 0; i < allFoodItems.length; i += BATCH_SIZE) {
      const batch = allFoodItems.slice(i, i + BATCH_SIZE);
      try {
        const batchResult = await FoodItem.insertMany(batch, { ordered: false });
        inserted = [...inserted, ...batchResult];
        console.log(`📦 Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allFoodItems.length / BATCH_SIZE)} (${batchResult.length} items)`);
      } catch (batchError) {
        failed++;
        console.error(`❌ Error in batch ${Math.floor(i / BATCH_SIZE) + 1}:`, batchError.message);
      }
    }
    
    console.log(`\n✅ Successfully seeded ${inserted.length} food items`);
    if (failed > 0) {
      console.log(`⚠️ ${failed} batches had errors`);
    }
    
    if (inserted.length > 0) {
      const priceStats = {
        min: Math.min(...inserted.map(i => i.price)),
        max: Math.max(...inserted.map(i => i.price)),
        avg: (inserted.reduce((sum, i) => sum + i.price, 0) / inserted.length).toFixed(2)
      };
      
      const categoryStats = {
        withDiscount: inserted.filter(i => i.discount > 0).length,
        popular: inserted.filter(i => i.isPopular).length,
        recommended: inserted.filter(i => i.isRecommended).length,
        new: inserted.filter(i => i.isNew).length,
        available: inserted.filter(i => i.isAvailable).length
      };
      
      console.log('\n📊 Seeding Statistics:');
      console.log('─────────────────────');
      console.log(`Total Items: ${inserted.length}`);
      console.log(`Price Range: $${priceStats.min} - $${priceStats.max}`);
      console.log(`Average Price: $${priceStats.avg}`);
      console.log(`Items with Discount: ${categoryStats.withDiscount}`);
      console.log(`Popular Items: ${categoryStats.popular}`);
      console.log(`Recommended Items: ${categoryStats.recommended}`);
      console.log(`New Items: ${categoryStats.new}`);
      console.log(`Available Items: ${categoryStats.available}`);
      
      console.log('\n📝 Sample food items:');
      const samples = inserted.slice(0, 3);
      samples.forEach((item, idx) => {
        const restaurant = restaurants.find(r => r._id.equals(item.restaurant));
        console.log(`  ${idx + 1}. ${item.name} - $${item.price} (${restaurant?.name || 'Unknown Restaurant'})`);
        console.log(`     Slug: ${item.slug}`);
        if (item.discount > 0) {
          console.log(`     🔥 ${item.discount}% OFF!`);
        }
        if (item.isPopular) {
          console.log(`     ⭐ Popular item`);
        }
      });
    }
    
    return inserted;
    
  } catch (error) {
    console.error('❌ Error seeding food items:', error);
    
    if (error.code === 11000) {
      console.error('Duplicate key error - likely duplicate slug for an item');
      console.error('This is handled by the pre-save middleware, but may occur if names are identical');
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
console.log('🍽️ Starting food items seeding...');
console.log('⚠️ Make sure you have seeded restaurants and users first!\n');

seedFoodItems().catch(console.error);
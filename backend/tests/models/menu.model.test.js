const mongoose = require("mongoose");
const Menu = require("../../models/menu");

describe("Menu Model Test", () => {
  let restaurantId;

  beforeEach(() => {
    restaurantId = new mongoose.Types.ObjectId();
  });

  test("should create a menu with valid data", async () => {
    const menuData = {
      restaurant: restaurantId,
      menu: [
        { category: "Appetizers", items: [] },
        { category: "Main Course", items: [] },
      ],
    };

    const menu = await Menu.create(menuData);

    expect(menu._id).toBeDefined();
    expect(menu.restaurant.toString()).toBe(restaurantId.toString());
    expect(menu.menu).toHaveLength(2);
    expect(menu.menu[0].category).toBe("Appetizers");
    expect(menu.menu[1].category).toBe("Main Course");
  });

  test("should create menu with food items", async () => {
    const foodItemId1 = new mongoose.Types.ObjectId();
    const foodItemId2 = new mongoose.Types.ObjectId();

    const menuData = {
      restaurant: restaurantId,
      menu: [
        {
          category: "Appetizers",
          items: [foodItemId1, foodItemId2],
        },
      ],
    };

    const menu = await Menu.create(menuData);

    expect(menu.menu[0].items).toHaveLength(2);
    expect(menu.menu[0].items[0].toString()).toBe(foodItemId1.toString());
    expect(menu.menu[0].items[1].toString()).toBe(foodItemId2.toString());
  });

  test("should require restaurant field", async () => {
    const menuData = {
      menu: [{ category: "Appetizers", items: [] }],
    };

    await expect(Menu.create(menuData)).rejects.toThrow();
  });

  test("should allow empty menu array", async () => {
    const menuData = {
      restaurant: restaurantId,
      menu: [],
    };

    const menu = await Menu.create(menuData);

    expect(menu._id).toBeDefined();
    expect(menu.menu).toHaveLength(0);
  });
});

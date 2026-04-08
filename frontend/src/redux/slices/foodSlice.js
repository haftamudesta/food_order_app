import { createSlice } from "@reduxjs/toolkit";
import {
  getAllFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  searchFoodItems,
  getPopularFoodItems,
  getDiscountedFoodItems,
  incrementOrderCount,
  getItemsByCategory
} from "../actions/foodAction";

const initialState = {
  foodItems: [],
  selectedFoodItem: null,
  popularItems: [],
  discountedItems: [],
  searchResults: [],
  categoryItems: [],
  loading: false,
  error: null,
  total: 0,
  count: 0,
  page: 1,
  pages: 1,
   filters: {
    restaurantId: null,
    isAvailable: true,
    isPopular: false,
    isNewone: false,
    minPrice: null,
    maxPrice: null,
    category: null,
    sortBy: "-createdAt"
  }
};

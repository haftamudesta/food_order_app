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

const foodSlice = createSlice({
  name: "food",
  initialState,
  reducers: {
    clearFoodError: (state) => {
      state.error = null;
    },
     clearSelectedFoodItem: (state) => {
      state.selectedFoodItem = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearCategoryItems: (state) => {
      state.categoryItems = [];
    },
    setFoodFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFoodFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateFoodItemLocally: (state, action) => {
      const index = state.foodItems.findIndex(item => item._id === action.payload._id);
      if (index !== -1) {
        state.foodItems[index] = { ...state.foodItems[index], ...action.payload };
      }
      if (state.selectedFoodItem?._id === action.payload._id) {
        state.selectedFoodItem = { ...state.selectedFoodItem, ...action.payload };
      }
    },
    toggleFoodAvailability: (state, action) => {
      const foodItem = state.foodItems.find(item => item._id === action.payload);
      if (foodItem) {
        foodItem.isAvailable = !foodItem.isAvailable;
      }
    }
}
})

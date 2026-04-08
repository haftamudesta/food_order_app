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
},
extraReducers: (builder) => {
    builder
      .addCase(getAllFoodItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllFoodItems.fulfilled, (state, action) => {
        state.loading = false;
        state.foodItems = action.payload.foodItems;
        state.count = action.payload.count;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
       .addCase(getAllFoodItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.foodItems = [];
      })
      .addCase(getFoodItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFoodItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFoodItem = action.payload;
      })
      .addCase(getFoodItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFoodItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFoodItem.fulfilled, (state, action) => {
        state.loading = false;
        state.foodItems.unshift(action.payload);
        state.count += 1;
        state.total += 1;
      })
      .addCase(createFoodItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateFoodItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFoodItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.foodItems.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.foodItems[index] = action.payload;
        }
        if (state.selectedFoodItem?._id === action.payload._id) {
          state.selectedFoodItem = action.payload;
        }
      })
      .addCase(updateFoodItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteFoodItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFoodItem.fulfilled, (state, action) => {
        state.loading = false;
        state.foodItems = state.foodItems.filter(item => item._id !== action.payload);
        state.count -= 1;
        state.total -= 1;
        if (state.selectedFoodItem?._id === action.payload) {
          state.selectedFoodItem = null;
        }
      })
      .addCase(deleteFoodItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchFoodItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchFoodItems.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.foodItems;
        state.count = action.payload.count;
      })
      .addCase(searchFoodItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.searchResults = [];
      })
      .addCase(getPopularFoodItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPopularFoodItems.fulfilled, (state, action) => {
        state.loading = false;
        state.popularItems = action.payload.foodItems;
      })
      .addCase(getPopularFoodItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.popularItems = [];
      })
      .addCase(getDiscountedFoodItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDiscountedFoodItems.fulfilled, (state, action) => {
        state.loading = false;
        state.discountedItems = action.payload.foodItems;
      })
      .addCase(getDiscountedFoodItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.discountedItems = [];
      })
       .addCase(incrementOrderCount.fulfilled, (state, action) => {
        const foodItem = state.foodItems.find(item => item._id === action.payload.id);
        if (foodItem) {
          foodItem.orderCount = action.payload.orderCount;
        }
        const popularItem = state.popularItems.find(item => item._id === action.payload.id);
        if (popularItem) {
          popularItem.orderCount = action.payload.orderCount;
        }
      })
       .addCase(getItemsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getItemsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryItems = {
          category: action.payload.category,
          items: action.payload.foodItems,
          count: action.payload.count
        };
      })
      .addCase(getItemsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.categoryItems = [];
      })
    }
})

export const {
  clearFoodError,
  clearSelectedFoodItem,
  clearSearchResults,
  clearCategoryItems,
  setFoodFilters,
  resetFoodFilters,
  updateFoodItemLocally,
  toggleFoodAvailability
} = foodSlice.actions;

export default foodSlice.reducer;

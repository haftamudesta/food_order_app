import { createSlice } from "@reduxjs/toolkit";
import {
  getAllMenus,
  getMenuByRestaurant,
  createMenu,
  deleteMenu,
  addItemsToMenu,
  removeItemsFromMenu,
  bulkAddItemsToMenu,
  updateCategoryName
} from "../actions/menuAction";

const initialState = {
  menus: [],
  currentMenu: null,
  loading: false,
  error: null,
  count: 0,
  selectedCategory: null,
  categories: []
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    clearMenuError: (state) => {
      state.error = null;
    },
    clearCurrentMenu: (state) => {
      state.currentMenu = null;
      state.categories = [];
      state.selectedCategory = null;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    addCategoryLocally: (state, action) => {
      if (state.currentMenu) {
        const newCategory = {
          category: action.payload,
          items: []
        };
        state.currentMenu.menu.push(newCategory);
        state.categories = state.currentMenu.menu.map(cat => cat.category);
      }
    },
    removeCategoryLocally: (state, action) => {
      if (state.currentMenu) {
        state.currentMenu.menu = state.currentMenu.menu.filter(
          cat => cat.category !== action.payload
        );
        state.categories = state.currentMenu.menu.map(cat => cat.category);
      }
    },
    updateCategoryLocally: (state, action) => {
      if (state.currentMenu) {
        const { oldCategory, newCategory } = action.payload;
        const category = state.currentMenu.menu.find(cat => cat.category === oldCategory);
        if (category) {
          category.category = newCategory;
          state.categories = state.currentMenu.menu.map(cat => cat.category);
        }
      }
    }
}
})
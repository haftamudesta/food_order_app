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
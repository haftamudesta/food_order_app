import { createSlice } from "@reduxjs/toolkit";
import {
  getAllMenus,
  getMenuByRestaurant,
  createMenu,
  deleteMenu,
  addItemsToMenu,
  removeItemsFromMenu,
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
    },
    extraReducers: (builder) => {
    builder
      .addCase(getAllMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = action.payload.menus;
        state.count = action.payload.count;
      })
      .addCase(getAllMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.menus = [];
      })
      .addCase(getMenuByRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMenuByRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMenu = action.payload;
        state.categories = action.payload.menu?.map(cat => cat.category) || [];
      })
      .addCase(getMenuByRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentMenu = null;
      })
      .addCase(createMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMenu = action.payload;
        state.menus.push(action.payload);
        state.categories = action.payload.menu?.map(cat => cat.category) || [];
      })
      .addCase(createMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = state.menus.filter(menu => menu._id !== action.payload);
        if (state.currentMenu?._id === action.payload) {
          state.currentMenu = null;
          state.categories = [];
        }
      })
      .addCase(deleteMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       .addCase(addItemsToMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemsToMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMenu = action.payload;
        state.categories = action.payload.menu?.map(cat => cat.category) || [];
      })
      .addCase(addItemsToMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeItemsFromMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemsFromMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMenu = action.payload;
        state.categories = action.payload.menu?.map(cat => cat.category) || [];
      })
      .addCase(removeItemsFromMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCategoryName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategoryName.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMenu = action.payload;
        state.categories = action.payload.menu?.map(cat => cat.category) || [];
      })
      .addCase(updateCategoryName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    }
}
})

export const {
  clearMenuError,
  clearCurrentMenu,
  setSelectedCategory,
  addCategoryLocally,
  removeCategoryLocally,
  updateCategoryLocally
} = menuSlice.actions;

export default menuSlice.reducer;
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";

export const getAllMenus = createAsyncThunk(
  "menu/getAllMenus",
  async (storeId = null, { rejectWithValue }) => {
    try {
      const url = storeId ? `/v1/menu?storeId=${storeId}` : "/v1/menu";
      const { data } = await axiosInstance.get(url);
      return {
        menus: data.menu,
        count: data.count
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getMenuByRestaurant = createAsyncThunk(
  "menu/getMenuByRestaurant",
  async (restaurantId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/menu/restaurant/${restaurantId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createMenu = createAsyncThunk(
  "menu/createMenu",
  async (menuData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/menu", menuData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteMenu = createAsyncThunk(
  "menu/deleteMenu",
  async (menuId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/v1/menu/${menuId}`);
      return menuId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addItemsToMenu = createAsyncThunk(
  "menu/addItemsToMenu",
  async ({ menuId, category, foodItemId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/v1/menu/${menuId}/items`, {
        category,
        foodItemId
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeItemsFromMenu = createAsyncThunk(
  "menu/removeItemsFromMenu",
  async ({ menuId, category, foodItemId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/v1/menu/${menuId}/items`, {
        data: { category, foodItemId }
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

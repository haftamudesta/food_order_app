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


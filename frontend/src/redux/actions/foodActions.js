import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";

export const getAllFoodItems = createAsyncThunk(
  "food/getAllFoodItems",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (filters.restaurantId) params.append("restaurantId", filters.restaurantId);
      if (filters.isAvailable !== undefined) params.append("isAvailable", filters.isAvailable);
      if (filters.isPopular !== undefined) params.append("isPopular", filters.isPopular);
      if (filters.isNew !== undefined) params.append("isNew", filters.isNew);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.category) params.append("category", filters.category);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      const { data } = await axiosInstance.get(`/v1/food/allfoods?${params}`);
      return {
        foodItems: data.data,
        count: data.count,
        total: data.total,
        page: data.page,
        pages: data.pages
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const getFoodItemById = createAsyncThunk(
  "food/getFoodItemById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/food/${id}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createFoodItem = createAsyncThunk(
  "food/createFoodItem",
  async (foodData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/food", foodData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
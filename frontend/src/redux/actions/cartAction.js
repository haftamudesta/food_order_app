import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";

export const getCart = createAsyncThunk(
  "cart/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/cart");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ foodItemId, quantity = 1, specialInstructions = "" }, { rejectWithValue }) => {
    try {
      console.log("Sending to cart:", { foodItemId, quantity, specialInstructions });
      const { data } = await axiosInstance.post("/v1/cart/add", {
        foodItemId,
        quantity,
        specialInstructions
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity, specialInstructions }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put("/v1/cart/update", {
        itemId,
        quantity,
        specialInstructions
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/v1/cart/remove/${itemId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete("/v1/cart/clear");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (couponCode, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/cart/coupon", { couponCode });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeCoupon = createAsyncThunk(
  "cart/removeCoupon",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete("/v1/cart/coupon");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getCartSummary = createAsyncThunk(
  "cart/getCartSummary",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/cart/summary");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


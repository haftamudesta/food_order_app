import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

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
  async ({ foodItemId, quantity = 1, specialInstructions = "" }, { rejectWithValue, dispatch }) => {
    try {
      console.log("Sending to cart:", { foodItemId, quantity, specialInstructions });
      const { data } = await axiosInstance.post("/v1/cart/add", {
        foodItemId,
        quantity,
        specialInstructions
      });
      
      toast.success("Item added to cart successfully!", {
        duration: 3000,
        icon: '🛒',
      });
      
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Add to cart error:", errorMessage);
      
      if (errorMessage.includes("different restaurants")) {
        toast.error(
          "Cart cleared! You can now add items from this restaurant.",
          { duration: 4000 }
        );
        // Refresh cart to get updated state
        await dispatch(getCart());
      } else {
        toast.error(errorMessage, { duration: 4000 });
      }
      
      return rejectWithValue(errorMessage);
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
      
      toast.success("Cart updated successfully!", {
        duration: 2000,
      });
      
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { duration: 3000 });
      return rejectWithValue(errorMessage);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/v1/cart/remove/${itemId}`);
      
      toast.success("Item removed from cart!", {
        duration: 2000,
      });
      
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { duration: 3000 });
      return rejectWithValue(errorMessage);
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete("/v1/cart/clear");
      
      toast.success("Cart cleared successfully!", {
        duration: 2000,
      });
      
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { duration: 3000 });
      return rejectWithValue(errorMessage);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (couponCode, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/cart/coupon", { couponCode });
      
      toast.success(`Coupon ${couponCode} applied successfully!`, {
        duration: 3000,
      });
      
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { duration: 3000 });
      return rejectWithValue(errorMessage);
    }
  }
);

export const removeCoupon = createAsyncThunk(
  "cart/removeCoupon",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete("/v1/cart/coupon");
      
      toast.success("Coupon removed successfully!", {
        duration: 2000,
      });
      
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { duration: 3000 });
      return rejectWithValue(errorMessage);
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
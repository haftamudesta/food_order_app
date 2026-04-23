import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";

export const getRestaurants = createAsyncThunk(
  "restaurants/getRestaurants",
  async (keyword = "", { rejectWithValue }) => {
    try {
      const params = {};
      if (keyword && keyword.trim() !== "") {
        params.keyword = keyword;
      }
      
      const { data } = await axiosInstance.get(`/v1/restaurant`, { params });
      
      return {
        restaurants: data.data?.restaurants || [],  
        count: data.total || 0 
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const searchRestaurants = createAsyncThunk(
  "restaurants/searchRestaurants",
  async ({ query, cuisine, city, minRating, maxPrice } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (query) params.keyword = query;
      if (cuisine) params.cuisine = cuisine;
      if (city) params.city = city;
      if (minRating) params.minRating = minRating;
      if (maxPrice) params.maxPrice = maxPrice;
      
      const { data } = await axiosInstance.get('/v1/restaurant', { params });
      
      return {
        restaurants: data.data?.restaurants || [],
        count: data.total || 0,
        results: data.results || 0
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getRestaurantById = createAsyncThunk(
  "restaurants/getRestaurantById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/restaurant/${id}`);
      return data.data.restaurant;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
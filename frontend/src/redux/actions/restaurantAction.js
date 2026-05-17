import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

export const getRestaurants = createAsyncThunk(
  "restaurants/getRestaurants",
  async ({ keyword = "", cuisine = "", city = "", minRating = "", maxPrice = "", page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (keyword && keyword.trim() !== "") params.keyword = keyword;
      if (cuisine) params.cuisine = cuisine;
      if (city) params.city = city;
      if (minRating) params.minRating = minRating;
      if (maxPrice) params.maxPrice = maxPrice;
      if (page) params.page = page;
      if (limit) params.limit = limit;
      
      const { data } = await axiosInstance.get(`/v1/restaurant`, { params });
      
      let restaurants = [];
      let total = 0;
      
      if (data.data?.restaurants) {
        restaurants = data.data.restaurants;
        total = data.total || restaurants.length;
      } else if (data.restaurants) {
        restaurants = data.restaurants;
        total = data.total || restaurants.length;
      } else if (Array.isArray(data)) {
        restaurants = data;
        total = restaurants.length;
      }
      
      return {
        restaurants,
        total,
        page: data.page || page,
        pages: data.pages || Math.ceil(total / limit),
        results: restaurants.length
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const searchRestaurants = createAsyncThunk(
  "restaurants/searchRestaurants",
  async ({ query, cuisine, city, minRating, maxPrice, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (query) params.keyword = query;
      if (cuisine) params.cuisine = cuisine;
      if (city) params.city = city;
      if (minRating) params.minRating = minRating;
      if (maxPrice) params.maxPrice = maxPrice;
      if (page) params.page = page;
      if (limit) params.limit = limit;
      
      const { data } = await axiosInstance.get('/v1/restaurant/search', { params });
      
      let restaurants = [];
      if (data.data?.restaurants) {
        restaurants = data.data.restaurants;
      } else if (data.restaurants) {
        restaurants = data.restaurants;
      }
      
      return {
        restaurants,
        results: data.results || restaurants.length,
        total: data.total || restaurants.length,
        page: data.page || page,
        pages: data.pages || 1
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
      
      let restaurant;
      if (data.data?.restaurant) {
        restaurant = data.data.restaurant;
      } else if (data.restaurant) {
        restaurant = data.restaurant;
      } else {
        restaurant = data;
      }
      
      return restaurant;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getFeaturedRestaurants = createAsyncThunk(
  "restaurants/getFeaturedRestaurants",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/v1/restaurant/featured');
      
      let restaurants = [];
      if (data.data?.restaurants) {
        restaurants = data.data.restaurants;
      } else if (data.restaurants) {
        restaurants = data.restaurants;
      }
      
      return restaurants;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createRestaurant = createAsyncThunk(
  "restaurants/createRestaurant",
  async (restaurantData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/restaurant", restaurantData);
      
      toast.success("Restaurant created successfully!", {
        duration: 3000,
      });
      
      let restaurant;
      if (data.data?.restaurant) {
        restaurant = data.data.restaurant;
      } else if (data.restaurant) {
        restaurant = data.restaurant;
      } else {
        restaurant = data;
      }
      
      return restaurant;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { duration: 4000 });
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateRestaurant = createAsyncThunk(
  "restaurants/updateRestaurant",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/v1/restaurant/${id}`, updateData);
      
      toast.success("Restaurant updated successfully!", {
        duration: 3000,
      });
      
      let restaurant;
      if (data.data?.restaurant) {
        restaurant = data.data.restaurant;
      } else if (data.restaurant) {
        restaurant = data.restaurant;
      } else {
        restaurant = data;
      }
      
      return restaurant;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { duration: 4000 });
      return rejectWithValue(errorMessage);
    }
  }
);


export const deleteRestaurant = createAsyncThunk(
  "restaurants/deleteRestaurant",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/v1/restaurant/${id}`);
      
      toast.success("Restaurant deactivated successfully!", {
        duration: 3000,
      });
      
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { duration: 4000 });
      return rejectWithValue(errorMessage);
    }
  }
);

export const permanentDeleteRestaurant = createAsyncThunk(
  "restaurants/permanentDeleteRestaurant",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/v1/restaurant/${id}/permanent`);
      
      toast.success("Restaurant permanently deleted!", {
        duration: 3000,
      });
      
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { duration: 4000 });
      return rejectWithValue(errorMessage);
    }
  }
);

// Get my restaurants (for restaurant owner)
export const getMyRestaurants = createAsyncThunk(
  "restaurants/getMyRestaurants",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/restaurant/my-restaurants");
      
      let restaurants = [];
      if (data.data?.restaurants) {
        restaurants = data.data.restaurants;
      } else if (data.restaurants) {
        restaurants = data.restaurants;
      }
      
      return restaurants;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleRestaurantStatus = createAsyncThunk(
  "restaurants/toggleRestaurantStatus",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/v1/restaurant/${id}/toggle-status`);
      
      toast.success(data.message || "Restaurant status updated!", {
        duration: 3000,
      });
      
      return { id, isActive: data.data?.isActive };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { duration: 4000 });
      return rejectWithValue(errorMessage);
    }
  }
);

export const getOperatingHours = createAsyncThunk(
  "restaurants/getOperatingHours",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/restaurant/${id}/hours`);
      
      return {
        restaurantName: data.data?.restaurant,
        operatingHours: data.data?.operatingHours
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const checkIsOpen = createAsyncThunk(
  "restaurants/checkIsOpen",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/restaurant/${id}/is-open`);
      
      return {
        isOpen: data.data?.isOpen,
        currentDay: data.data?.currentDay,
        currentTime: data.data?.currentTime,
        hours: data.data?.hours
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get restaurant statistics
export const getRestaurantStats = createAsyncThunk(
  "restaurants/getRestaurantStats",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/restaurant/${id}/stats`);
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Set primary image
export const setPrimaryImage = createAsyncThunk(
  "restaurants/setPrimaryImage",
  async ({ restaurantId, imageId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/v1/restaurant/${restaurantId}/images/${imageId}/primary`);
      
      toast.success("Primary image updated!", {
        duration: 2000,
      });
      
      return data.data?.images;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { duration: 4000 });
      return rejectWithValue(errorMessage);
    }
  }
);
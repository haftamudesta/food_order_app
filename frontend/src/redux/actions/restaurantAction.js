import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";


export const getRestaurants=createAsyncThunk( "restaurants/getRestaurants",async(keyword=" ",{rejectWithValue})=>{
    try {
        const {data}=await axiosInstance.get(`/v1/restaurant?keyword=${keyword}`)
        console.log("Fetched restaurants",data)
        return{
            restaurants:data.restaurants,
            count:data.count
        }
    } catch (error) {
        return rejectWithValue(error.response?.data.message|| error.message)
    }
})

// Search restaurants
export const searchRestaurants = createAsyncThunk(
  "restaurants/searchRestaurants",
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/v1/restaurant/search', {
        params: {
          q: query,
          ...filters
        }
      });
      return {
        restaurants: data.restaurants,
        count: data.count
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
    }
);
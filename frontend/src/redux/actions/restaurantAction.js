import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";


export const getRestaurants=createAsyncThunk( "restaurants/getRestaurants",async(keyword=" ",{rejectWithValue})=>{
    try {
        const {data}=await axiosInstance.get(`/restaurant?keyword=${keyword}`)
        console.log("Fetched restaurants",data)
        return{
            restaurants:data.restaurants,
            count:data.count
        }
    } catch (error) {
        return rejectWithValue(error.response?.data.message|| error.message)
    }
})
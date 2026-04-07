import { createSlice } from "@reduxjs/toolkit";
import { getRestaurants,getRestaurantById } from "../actions/restaurantAction";

const initialState={
    restaurants:[],
    count:0,
    loading:false,
    error:null,
    showVegOnly:false,
    pureVegRestaurantCount:0,
}

const restaurantSlice=createSlice({
    name:"restaurants",
    initialState,
    reducers:{
        sortByRating:(state)=>{
            state.restaurants.sort((a,b)=>b.rating-a.rating)
        },
        sortByReview:(state)=>{
            state.restaurants.sort((a,b)=>b.rating-a.rating)
        },
        toggleVegOnly:(state)=>{
            state.showVegOnly=!state.showVegOnly;
            state.pureVegRestaurantCount=calculatePureVegCount(state.restaurants,state.showVegOnly)
        },
        clearError:(state)=>{
            state.error=null
        },
        clearSelectedRestaurant: (state) => {
            state.selectedRestaurant = null;
            state.error = null;
        },
    },
    extraReducers:(builder)=>{
        builder.addCase(getRestaurants.pending,(state)=>{
            state.loading=true
        })
        .addCase(getRestaurants.fulfilled,(state,action)=>{
            state.loading=false;
            state.restaurants=action.payload.restaurants;
            state.count=action.payload.count;
        })
        .addCase(getRestaurants.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload||"faild to fetch restaurant"
        })
        .addCase(getRestaurantById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getRestaurantById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedRestaurant = action.payload;
            })
            .addCase(getRestaurantById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch restaurant details"
            })
    }
})

export const{
    sortByRating,
    sortByReview,
    toggleVegOnly,
    clearError,
    clearSelectedRestaurant
}=restaurantSlice.actions

export default restaurantSlice.reducer

const calculatePureVegCount=(restaurants,showVegOnly)=>{
    if(!showVegOnly) return restaurants.length
    return restaurants.filter(restaurant=>restaurant.isveg).length
}
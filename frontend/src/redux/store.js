import { configureStore } from "@reduxjs/toolkit";
import restaurantReducer from "./slices/restaurantSlice"
import userReducer from "./slices/userSlice"
import foodReducer from "./slices/foodSlice";

const store=configureStore({
    reducer:{
        restaurants:restaurantReducer,
        user:userReducer,
        food: foodReducer,
    }
})

export default store
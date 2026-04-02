import { configureStore } from "@reduxjs/toolkit";
import restaurantReducer from "./slices/restaurantSlice"
import userReducer from "./slices/userSlice"

const store=configureStore({
    reducer:{
        restaurants:restaurantReducer,
        user:userReducer,
    }
})
export default store
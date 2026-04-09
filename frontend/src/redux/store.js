import { configureStore } from "@reduxjs/toolkit";
import restaurantReducer from "./slices/restaurantSlice"
import userReducer from "./slices/userSlice"
import foodReducer from "./slices/foodSlice";
import authReducer from "./slices/authSlice";

const store=configureStore({
    reducer:{
        restaurants:restaurantReducer,
        user:userReducer,
        food: foodReducer,
        menu: menuReducer,
    }
})

export default store
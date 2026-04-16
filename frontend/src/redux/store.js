import { configureStore } from "@reduxjs/toolkit";
import restaurantReducer from "./slices/restaurantSlice"
import userReducer from "./slices/userSlice"
import foodReducer from "./slices/foodSlice";
import menuReducer from "./slices/menuSlice"
import cartReducer from "./slices/cartSlice";
import paymentReducer from "./slices/paymentSlice";

const store=configureStore({
    reducer:{
        restaurants:restaurantReducer,
        user:userReducer,
        food: foodReducer,
        menu: menuReducer,
        cart: cartReducer,
        payment: paymentReducer,
    }
})

export default store
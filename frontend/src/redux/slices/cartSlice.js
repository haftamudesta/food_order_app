import { createSlice } from "@reduxjs/toolkit";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getCartSummary
} from "../actions/cartAction";

const initialState = {
  items: [],
  restaurant: null,
  subtotal: 0,
  tax: 0,
  deliveryFee: 0,
  discount: 0,
  total: 0,
  itemCount: 0,
  couponCode: null,
  loading: false,
  error: null,
  isOpen: false
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    resetCart: () => initialState,
    updateItemQuantityLocally: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(i => i._id === itemId);
      if (item) {
        item.quantity = quantity;
        item.totalPrice = item.price * quantity;
        state.subtotal = state.items.reduce((sum, i) => sum + i.totalPrice, 0);
        state.tax = state.subtotal * 0.1;
        state.deliveryFee = state.subtotal < 50 ? 5 : 0;
        state.total = state.subtotal + state.tax + state.deliveryFee - state.discount;
        state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.restaurant = action.payload.restaurant || null;
        state.subtotal = action.payload.subtotal || 0;
        state.tax = action.payload.tax || 0;
        state.deliveryFee = action.payload.deliveryFee || 0;
        state.discount = action.payload.discount || 0;
        state.total = action.payload.total || 0;
        state.itemCount = action.payload.itemCount || 0;
        state.couponCode = action.payload.couponCode || null;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.restaurant = action.payload.restaurant;
        state.subtotal = action.payload.subtotal;
        state.tax = action.payload.tax;
        state.deliveryFee = action.payload.deliveryFee;
        state.discount = action.payload.discount;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
        state.couponCode = action.payload.couponCode;
        state.isOpen = true; // Open cart when item is added
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.tax = action.payload.tax;
        state.deliveryFee = action.payload.deliveryFee;
        state.discount = action.payload.discount;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.restaurant = action.payload.restaurant;
        state.subtotal = action.payload.subtotal;
        state.tax = action.payload.tax;
        state.deliveryFee = action.payload.deliveryFee;
        state.discount = action.payload.discount;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
        state.couponCode = action.payload.couponCode;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.restaurant = null;
        state.subtotal = 0;
        state.tax = 0;
        state.deliveryFee = 0;
        state.discount = 0;
        state.total = 0;
        state.itemCount = 0;
        state.couponCode = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.couponCode = action.payload.couponCode;
        state.discount = action.payload.discount;
        state.total = action.payload.total;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.couponCode = null;
        state.discount = 0;
        state.total = action.payload.total;
      })
      
      .addCase(getCartSummary.fulfilled, (state, action) => {
        if (action.payload.isEmpty) {
          state.items = [];
          state.itemCount = 0;
        } else {
          state.items = action.payload.items;
          state.restaurant = action.payload.restaurant;
          state.subtotal = action.payload.subtotal;
          state.tax = action.payload.tax;
          state.deliveryFee = action.payload.deliveryFee;
          state.discount = action.payload.discount;
          state.total = action.payload.total;
          state.itemCount = action.payload.itemCount;
          state.couponCode = action.payload.couponCode;
        }
      });
  }
});

export const {
  clearCartError,
  toggleCart,
  openCart,
  closeCart,
  resetCart,
  updateItemQuantityLocally
} = cartSlice.actions;

export default cartSlice.reducer;
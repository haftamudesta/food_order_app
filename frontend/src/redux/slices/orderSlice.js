import { createSlice } from "@reduxjs/toolkit";
import {
  getSingleOrder,
  myOrders,
  getAllOrders,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getOrderStatistics,
} from "../actions/orderAction";

const initialState = {
  order: null,        
  orders: [],         
  allOrders: [],      
  statistics: null,  
  loading: false,
  error: null,
  success: false,
  totalOrders: 0,
  totalAmount: 0,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearOrderSuccess: (state) => {
      state.success = false;
    },
    resetOrderState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSingleOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getSingleOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(myOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(myOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.totalOrders = action.payload?.length || 0;
      })
      .addCase(myOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = action.payload;
        state.totalOrders = action.payload?.length || 0;
      
        let total = 0;
        action.payload?.forEach(order => {
          total += order.finalTotal || 0;
        });
        state.totalAmount = total;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.success = true;
        if (action.payload) {
          state.orders = [action.payload, ...state.orders];
          state.totalOrders = state.orders.length;
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.success = true;
        
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        
        const allIndex = state.allOrders.findIndex(
          (order) => order._id === action.payload._id
        );
        if (allIndex !== -1) {
          state.allOrders[allIndex] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.success = true;
        
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        
        const allIndex = state.allOrders.findIndex(
          (order) => order._id === action.payload._id
        );
        if (allIndex !== -1) {
          state.allOrders[allIndex] = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = state.allOrders.filter(
          (order) => order._id !== action.payload
        );
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload
        );
        state.totalOrders = state.allOrders.length;
        state.success = true;
        
        let total = 0;
        state.allOrders.forEach(order => {
          total += order.finalTotal || 0;
        });
        state.totalAmount = total;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOrderStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(getOrderStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, clearOrderSuccess, resetOrderState } =
  orderSlice.actions;
export default orderSlice.reducer;
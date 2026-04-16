import { createSlice } from "@reduxjs/toolkit";
import {
  createPaymentIntent,
  confirmPayment,
  processRefund,
  getPaymentStatus,
  getPaymentHistory,
  processStripePayment
} from "../actions/paymentAction";

const initialState = {
  currentPayment: null,
  paymentHistory: [],
  paymentStatus: null,
  loading: false,
  error: null,
  clientSecret: null,
  paymentIntent: null
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
      state.clientSecret = null;
      state.paymentIntent = null;
    },
    resetPaymentState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
        state.currentPayment = {
          paymentId: action.payload.paymentId,
          transactionId: action.payload.transactionId
        };
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.paymentStatus = 'completed';
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paymentStatus = 'failed';
      })
      
      .addCase(processRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentPayment?._id === action.payload._id) {
          state.currentPayment = action.payload;
        }
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStatus = action.payload.status;
        state.currentPayment = action.payload;
      })
      .addCase(getPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(processStripePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processStripePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentIntent = action.payload.paymentIntent;
        state.paymentStatus = action.payload.success ? 'completed' : 'failed';
      })
      .addCase(processStripePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paymentStatus = 'failed';
      });
  }
});

export const { clearPaymentError, clearCurrentPayment, resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";
import { loadStripe } from '@stripe/stripe-js';


let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export const createPaymentIntent = createAsyncThunk(
  "payment/createPaymentIntent",
  async ({ orderId, paymentMethod = 'credit_card' }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/payment/create-payment-intent", {
        orderId,
        paymentMethod
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const confirmPayment = createAsyncThunk(
  "payment/confirmPayment",
  async (paymentIntentId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/payment/confirm-payment", {
        paymentIntentId
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const processRefund = createAsyncThunk(
  "payment/processRefund",
  async ({ paymentId, amount, reason }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/payment/refund", {
        paymentId,
        amount,
        reason
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getPaymentStatus = createAsyncThunk(
  "payment/getPaymentStatus",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/payment/status/${orderId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getPaymentHistory = createAsyncThunk(
  "payment/getPaymentHistory",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/payment/history");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const processStripePayment = createAsyncThunk(
  "payment/processStripePayment",
  async ({ orderId, paymentMethod }, { rejectWithValue, dispatch }) => {
    try {
      const { clientSecret } = await dispatch(createPaymentIntent({ orderId, paymentMethod })).unwrap();
      
      const stripe = await getStripe();
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (paymentIntent.status === 'succeeded') {
        await dispatch(confirmPayment(paymentIntent.id));
        return { success: true, paymentIntent };
      }
      
      return { success: false, paymentIntent };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
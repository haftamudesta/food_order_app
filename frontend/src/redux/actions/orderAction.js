import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios";

export const getSingleOrder = createAsyncThunk(
  "order/getSingleOrder",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/orders/${id}`);
      return data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const myOrders = createAsyncThunk(
  "order/myOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/orders/me/myorders");
      return data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/orders/allorders");
      return data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/orders/new", orderData);
      return data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/v1/orders/admin/${id}/status`, { status });
      return data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/v1/orders/${id}/cancel`);
      return data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "order/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/v1/orders/admin/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getOrderStatistics = createAsyncThunk(
  "order/getOrderStatistics",
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const { data } = await axiosInstance.get(`/v1/orders/admin/statistics?${params}`);
      return data.statistics || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getRecentOrders = createAsyncThunk(
  "order/getRecentOrders",
  async ({ limit = 10, page = 1 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/orders/recent?limit=${limit}&page=${page}`);
      return {
        orders: data.orders,
        total: data.total,
        page: data.page,
        pages: data.pages
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
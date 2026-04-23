import axiosInstance from "@/lib/axios";
import {
    loginRequest,
    loginSuccess,
    loginFail,
    loadUserFail,
    logoutSuccess,
    logoutFail,
    updateRequest,
    updateSuccess,
    updateFail,
    updateReset,
    clearError
 } from "../slices/userSlice";

 export const logIn = (email, password) => async (dispatch) => {
    try {
        dispatch(loginRequest());
        const { data } = await axiosInstance.post("/v1/auth/log_in", { email, password });
        dispatch(loginSuccess(data.data.user));
    } catch (error) {
        dispatch(loginFail(error.response?.data?.message || "Log in failed"));
    }
};

 export const signUp = (userData) => async (dispatch) => {
    try {
        dispatch(loginRequest());
        const { data } = await axiosInstance.post("/v1/auth/sign_up", userData);
        dispatch(loginSuccess(data.user));
        return data;
    } catch (error) {
        dispatch(loginFail(error.response?.data?.message || "Sign up failed"));
        throw error;
    }
};
 export const logout = () => async (dispatch) => {
    try {
        const { data } = await axiosInstance.post("/v1/users/log_out");
        dispatch(logoutSuccess(data.message));
    } catch (error) {
        dispatch(logoutFail(error.response?.data?.message || "Logout failed"));
    }
};

//Load user
export const loadUser = () => async (dispatch) => {
    try {
        dispatch(loginRequest());
        const { data } = await axiosInstance.get("/v1/users/profile");
        dispatch(loginSuccess(data.data.user));
    } catch (error) {
        dispatch(loadUserFail(error.response?.data?.message || "Load user failed"));
    }
};

export const updateProfile = (userData) => async (dispatch) => {
    try {
        dispatch(updateRequest());
        const { data } = await axiosInstance.put("/v1/users/profile", userData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        dispatch(updateSuccess(data.data.user));
        
        // Reset update state after 3 seconds
        setTimeout(() => {
            dispatch(updateReset());
        }, 3000);
    } catch (error) {
        dispatch(updateFail(error.response?.data?.message || "Update failed"));
    }
};

export const clearUserError = () => (dispatch) => {
    dispatch(clearError());
};
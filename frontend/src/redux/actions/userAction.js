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
    clearError,
    loadUserSuccess,
    getAllUsersRequest,
    getAllUsersSuccess,
    getAllUsersFail,
    updateUserStatusSuccess,
    updateUserRoleSuccess,
    deleteUserSuccess,
    clearSuccess
} from "../slices/userSlice";
import toast from "react-hot-toast";

let isFetchingUsers = false;

export const logIn = (email, password) => async (dispatch) => {
    try {
        dispatch(loginRequest());
        const { data } = await axiosInstance.post("/v1/auth/log_in", { email, password });

        let userData;
        if (data.data && data.data.user) {
            userData = data.data.user;
        } else if (data.user) {
            userData = data.user;
        } else {
            userData = data;
        }

        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        dispatch(loginSuccess(userData));
        toast.success(`Welcome back, ${userData.name}!`);
        return data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Log in failed";
        dispatch(loginFail(errorMessage));
        toast.error(errorMessage);
    }
};

export const signUp = (userData) => async (dispatch) => {
    try {
        dispatch(loginRequest());
        const { data } = await axiosInstance.post("/v1/auth/sign_up", userData);

        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        dispatch(loginSuccess(data.user));
        toast.success("Account created successfully!");
        return data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Sign up failed";
        dispatch(loginFail(errorMessage));
        toast.error(errorMessage);
        throw error;
    }
};

export const logout = () => async (dispatch) => {
    try {
        const { data } = await axiosInstance.post("/v1/auth/log_out");
        localStorage.removeItem("token");
        dispatch(logoutSuccess(data.message));
        toast.success("Logged out successfully");
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Logout failed";
        dispatch(logoutFail(errorMessage));
        toast.error(errorMessage);
    }
};

export const loadUser = () => async (dispatch) => {
    try {
        dispatch(loginRequest()); 
        
        const { data } = await axiosInstance.get("/v1/users/profile");
        
        let userData;
        if (data.data && data.data.user) {
            userData = data.data.user;
        } else if (data.user) {
            userData = data.user;
        } else if (data.data) {
            userData = data.data;
        } else {
            userData = data;
        }
        
        if (userData && userData._id) {
            dispatch(loadUserSuccess(userData));
        } else {
            throw new Error("Invalid user data received");
        }
    } catch (error) {
        dispatch(loadUserFail(error.response?.data?.message || "Load user failed"));
        localStorage.removeItem("token");
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
        
        let updatedUser;
        if (data.data && data.data.user) {
            updatedUser = data.data.user;
        } else if (data.user) {
            updatedUser = data.user;
        } else {
            updatedUser = data;
        }
        
        dispatch(updateSuccess(updatedUser));
        toast.success("Profile updated successfully!");
        
        setTimeout(() => {
            dispatch(updateReset());
        }, 3000);
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Update failed";
        dispatch(updateFail(errorMessage));
        toast.error(errorMessage);
    }
};

export const getAllUsers = () => async (dispatch) => {
    if (isFetchingUsers) {
        return;
    }
    
    try {
        isFetchingUsers = true;
        console.log("getAllUsers called - fetching users");
        dispatch(getAllUsersRequest()); 
        
        const { data } = await axiosInstance.get("/v1/users/get_all_users");
        
        console.log("getAllUsers success - users:", data.data?.length);
        
        dispatch(getAllUsersSuccess({
            users: data.data || [],
            count: data.count || 0
        }));
    } catch (error) {
        console.error("getAllUsers error:", error.response?.data?.message || error.message);
        const errorMessage = error.response?.data?.message || "Failed to fetch users";
        dispatch(getAllUsersFail(errorMessage));
    } finally {
        isFetchingUsers = false;
    }
};

export const updateUserStatus = ({ id, isActive }) => async (dispatch) => {
    try {
        await axiosInstance.put(`/v1/users/update-status/${id}`, { isActive });
        dispatch(updateUserStatusSuccess({ userId: id, isActive }));
        toast.success(`User ${isActive ? "activated" : "deactivated"} successfully`);
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to update user status";
        toast.error(errorMessage);
    }
};

export const updateUserRole = ({ id, role }) => async (dispatch) => {
    try {
        await axiosInstance.put(`/v1/users/update-role/${id}`, { role });
        dispatch(updateUserRoleSuccess({ userId: id, role }));
        toast.success(`User role updated to ${role}`);
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to update user role";
        toast.error(errorMessage);
    }
};

export const deleteUser = (id) => async (dispatch) => {
    try {
        await axiosInstance.delete(`/v1/users/delete_user/${id}`);
        dispatch(deleteUserSuccess(id));
        toast.success("User deleted successfully");
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to delete user";
        toast.error(errorMessage);
    }
};

export const updatePassword = (passwordData) => async (dispatch) => {
    try {
        dispatch(updateRequest());
        const { data } = await axiosInstance.put("/v1/users/update-password", passwordData);
        dispatch(updateSuccess(data.user));
        toast.success("Password updated successfully!");
        
        setTimeout(() => {
            dispatch(updateReset());
        }, 3000);
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to update password";
        dispatch(updateFail(errorMessage));
        toast.error(errorMessage);
    }
};

export const deleteOwnAccount = () => async (dispatch) => {
    try {
        await axiosInstance.delete("/v1/users/account");
        localStorage.removeItem("token");
        dispatch(logoutSuccess("Account deleted successfully"));
        toast.success("Account deleted successfully");
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to delete account";
        toast.error(errorMessage);
    }
};

export const getUserById = (id) => async (dispatch) => {
    try {
        const { data } = await axiosInstance.get(`/v1/users/get_user/${id}`);
        return data.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to fetch user";
        toast.error(errorMessage);
        throw error;
    }
};

export const getUserStats = () => async (dispatch) => {
    try {
        const { data } = await axiosInstance.get("/v1/users/stats");
        return data.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to fetch user statistics";
        toast.error(errorMessage);
        throw error;
    }
};

export const clearUserError = () => (dispatch) => {
    dispatch(clearError());
};

export const clearUserSuccess = () => (dispatch) => {
    dispatch(clearSuccess());
};
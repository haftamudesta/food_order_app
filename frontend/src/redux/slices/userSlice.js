import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    users: [], 
    totalUsers: 0,
    loading: false,
    isAuthenticated: false,
    error: null,
    isUpdated: false,
    message: null,
    success: null,
    token: null,
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginRequest: (state) => {
            state.loading = true;
            state.isAuthenticated = false;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
        },
        setToken: (state, action) => {
            state.token = action.payload;
        },
        loginFail: (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload;
        },
        loadUserRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        loadUserSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
        },
        loadUserFail: (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload;
        },
        logoutSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.message = action.payload;
            state.error = null;
        },
        logoutFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateSuccess: (state, action) => {
            state.loading = false;
            state.isUpdated = true;
            state.user = action.payload;
            state.error = null;
        },
        updateFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateReset: (state) => {
            state.isUpdated = false;
        },
        getAllUsersRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getAllUsersSuccess: (state, action) => {
            state.loading = false;
            state.users = action.payload.users || [];
            state.totalUsers = action.payload.count || 0;
            state.error = null;
        },
        getAllUsersFail: (state, action) => {
            state.loading = false;
            state.users = [];
            state.totalUsers = 0;
            state.error = action.payload;
        },
        updateUserStatusSuccess: (state, action) => {
            state.loading = false;
            state.success = true;
            const index = state.users.findIndex(u => u._id === action.payload.userId);
            if (index !== -1) {
                state.users[index].isActive = action.payload.isActive;
            }
        },
        updateUserRoleSuccess: (state, action) => {
            state.loading = false;
            state.success = true;
            const index = state.users.findIndex(u => u._id === action.payload.userId);
            if (index !== -1) {
                state.users[index].role = action.payload.role;
            }
        },
        deleteUserSuccess: (state, action) => {
            state.loading = false;
            state.users = state.users.filter(u => u._id !== action.payload);
            state.totalUsers = state.users.length;
            state.success = true;
        },
        clearSuccess: (state) => {
            state.success = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetState: () => initialState,
    }
})

export const {
    loginRequest,
    loginSuccess,
    loginFail,
    loadUserRequest,
    loadUserSuccess,
    loadUserFail,
    logoutSuccess,
    logoutFail,
    updateRequest,
    updateSuccess,
    updateFail,
    updateReset,
    getAllUsersRequest,
    getAllUsersSuccess,
    getAllUsersFail,
    updateUserStatusSuccess,
    updateUserRoleSuccess,
    deleteUserSuccess,
    clearSuccess,
    clearError,
    setToken,
    resetState
} = userSlice.actions

export default userSlice.reducer
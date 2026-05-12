import { createSlice } from "@reduxjs/toolkit";

const initialState={
    user:null,
    loading:false,
    isAuthenticated:false,
    error:null,
    isUpdated:false,
    message:null,
    success:null,
    token:null,
}

const userSlice=createSlice({
    name:"user",
    initialState,
    reducers:{
        loginRequest:(state)=>{
            state.loading=true;
            state.isAuthenticated=false;
        },
        loginSuccess:(state,action)=>{
            state.loading=false;
            state.isAuthenticated=true
            state.user=action.payload;
        },
        setToken: (state, action) => {
            state.token = action.payload;
        },
        loginFail:(state,action)=>{
            state.loading=false;
            state.isAuthenticated=false;
            state.user=null;
            state.error=action.payload;
        },
         loadUserRequest: (state) => {
            state.loading = true;
        },
        loadUserSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
        },
        loadUserFail:(state,action)=>{
            state.loading=false;
            state.isAuthenticated=false;
            state.user=null;
            state.error=action.payload;
        },
        logoutSuccess:(state)=>{
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.message = action.payload;
            state.error = null;
        },
        logoutFail:(state,action)=>{
            state.error=action.payload;
            
        },
        updateRequest:(state)=>{
            state.loading=true;
        },
        updateSuccess:(state,action)=>{
            state.loading=false;
            state.isUpdated=action.payload;
        },
        updateFail:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        updateReset:(state)=>{
            state.isUpdated=false
        },
        clearError:(state)=>{
            state.error=null
        }
    }
})

export const {
    loginRequest,loginSuccess,loginFail,loadUserRequest,loadUserSuccess,loadUserFail,logoutSuccess,logoutFail,updateRequest,updateSuccess,updateFail,updateReset,clearError,setToken
}=userSlice.actions

export default userSlice.reducer
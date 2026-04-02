import { createSlice } from "@reduxjs/toolkit";

const initialState={
    user:null,
    loading:false,
    isAuthenticated:false,
    error:null,
    isUpdated:false,
    message:null,
    success:null,
}

const userSlice=createSlice({
    name:"user",
    initialState,
    reducers:{
        //for log in,register,load
        loginRequest:(state)=>{
            state.loading=true;
            state.isAuthenticated=false;
        },
        loginSuccess:(state,action)=>{
            state.loading=false;
            state.isAuthenticated=true
            state.user=action.payload;
        },
        loginFail:(state,action)=>{
            state.loading=false;
            state.isAuthenticated=false;
            state.user=null;
            state.error=action.payload;
        },
        loadUserFail:(state,action)=>{
            state.loading=false;
            state.isAuthenticated=false;
            state.user=null;
            state.error=action.payload;
        },
        logoutSuccess:(state)=>{
            state.loading=false;
            state.isAuthenticated=false;
            state.user=null;
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
    loginRequest,loginSuccess,loginFail,loadUserFail,logoutSuccess,logoutFail,updateRequest,updateSuccess,updateFail,updateReset,clearError
}=userSlice.actions

export default userSlice.reducer
import { createSlice } from "@reduxjs/toolkit";


const initialState =  {
    isLoggedIn : false,
    user : null,
    accessToken : null

}

const authslice = createSlice({
    name : 'auth',
    initialState,
    reducers : {
        login : (state,action)=> {
            state.isLoggedIn = true;
            state.user = action.payload.user; 
            state.accessToken = action.payload.accessToken;
        },
        logout : (state) => {
            state.isLoggedIn = false;
            state.user = null;
            state.accessToken = null;
        }

    }

})
export const { login, logout } = authslice.actions;

export default authslice.reducer;

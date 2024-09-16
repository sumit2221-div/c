import { configureStore } from "@reduxjs/toolkit";
import authReducer from './authslice'

export default configureStore({
    reducer: {
      auth: authReducer,
    },
  });
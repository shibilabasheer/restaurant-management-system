import { configureStore, createReducer } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import menuReducer from './slices/menuSlice';

export const Store = configureStore({
  reducer: {
    user: userReducer,
    cart : cartReducer,
    menus : menuReducer
  },
});

export const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?._id || null;  
  } catch {
    return null;
  }
};

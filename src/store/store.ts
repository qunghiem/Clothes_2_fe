import { configureStore } from '@reduxjs/toolkit';
import shopReducer from './slices/shopSlice';
import cartReducer from './slices/cartSlice';
import uiReducer from './slices/uiSlice';
import { default as authReducer } from './slices/authSlice';
import ordersReducer from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    shop: shopReducer,
    cart: cartReducer,
    ui: uiReducer,
    auth: authReducer,
    orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore } from '@reduxjs/toolkit';
import shopReducer from './slices/shopSlice';
import cartReducer from './slices/cartSlice';
import uiReducer from './slices/uiSlice';
import { default as authReducer } from './slices/authSlice';
import ordersReducer from './slices/ordersSlice';

const sanitizeState = (state: any) => {
  if (state.auth && state.auth.users) {
    return {
      ...state,
      auth: {
        ...state.auth,
        users: state.auth.users.map((user: any) => ({
          ...user,
          password: '[HIDDEN]' // Hide password in DevTools
        }))
      }
    };
  }
  return state;
};

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
  devTools: process.env.NODE_ENV !== 'production' && {
    stateSanitizer: sanitizeState,
    actionSanitizer: (action: any) => {
      if (action.type === 'auth/registerUser' || action.type === 'auth/loginUser') {
        return {
          ...action,
          payload: {
            ...action.payload,
            password: '[HIDDEN]'
          }
        };
      }
      return action;
    },
    name: 'Ecommerce App'
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// src/store/middleware/authMiddleware.ts
import { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { initializeCart, clearCartOnLogout } from '../slices/cartSlice';
import { initializeOrders, clearOrdersOnLogout } from '../slices/ordersSlice';
import { RootState } from '../store';

// Middleware to handle cart and orders initialization/cleanup
export const authMiddleware: Middleware<{}, RootState> = 
  (store: MiddlewareAPI<any, RootState>) => 
  (next) => 
  (action: any) => {
    const result = next(action);

    // Handle cart and orders initialization after successful auth
    if (action.type === 'auth/initializeUserCart') {
      const userId: string = action.payload;
      store.dispatch(initializeCart(userId));
      store.dispatch(initializeOrders(userId));
    }

    // Handle cleanup when user logs out
    if (action.type === 'cart/clearCartOnLogout') {
      store.dispatch(clearCartOnLogout());
    }

    if (action.type === 'orders/clearOrdersOnLogout') {
      store.dispatch(clearOrdersOnLogout());
    }

    return result;
  };

export default authMiddleware;
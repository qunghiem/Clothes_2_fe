import { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { initializeCart, clearCartOnLogout } from '../slices/cartSlice';
import { initializeOrders, clearOrdersOnLogout } from '../slices/ordersSlice';
import { RootState } from '../store';

export const authMiddleware: Middleware<{}, RootState> = 
  (store: MiddlewareAPI<any, RootState>) => 
  (next) => 
  (action: any) => {
    const result = next(action);

    if (action.type === 'auth/initializeUserCart') {
      const userId: string = action.payload;
      store.dispatch(initializeCart(userId));
      store.dispatch(initializeOrders(userId));
    }

    if (action.type === 'cart/clearCartOnLogout') {
      store.dispatch(clearCartOnLogout());
    }

    if (action.type === 'orders/clearOrdersOnLogout') {
      store.dispatch(clearOrdersOnLogout());
    }

    return result;
  };

export default authMiddleware;
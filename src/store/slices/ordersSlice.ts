// src/store/slices/ordersSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

// Type definitions
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'card' | 'paypal' | 'bank_transfer';

export interface OrderItem {
  itemId: string;
  size: string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}

export interface DeliveryInfo {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  items: { [itemId: string]: { [size: string]: number } } | OrderItem[];
  deliveryInfo: DeliveryInfo;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
}

export interface OrdersState {
  orders: Order[];
  currentUserId: string | null;
  isLoading: boolean;
}

export interface AddOrderPayload {
  orderData: {
    paymentMethod?: PaymentMethod;
    totalAmount: number;
  };
  cartItems: { [itemId: string]: { [size: string]: number } } | OrderItem[];
  deliveryInfo: DeliveryInfo;
}

export interface UpdateOrderStatusPayload {
  orderId: string;
  status: OrderStatus;
}

// Redux store types
export interface RootState {
  orders: OrdersState;
  // Add other slices as needed
}

// Load orders from localStorage for specific user
const loadOrdersFromStorage = (userId: string | null = null): Order[] => {
  try {
    if (!userId) return [];
    const ordersKey = `orders_${userId}`;
    const storedOrders = localStorage.getItem(ordersKey);
    return storedOrders ? JSON.parse(storedOrders) : [];
  } catch (error) {
    console.error('Error loading orders from localStorage:', error);
    return [];
  }
};

// Save orders to localStorage for specific user
const saveOrdersToStorage = (orders: Order[], userId: string | null = null): void => {
  try {
    if (!userId) return;
    const ordersKey = `orders_${userId}`;
    localStorage.setItem(ordersKey, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving orders to localStorage:', error);
  }
};

const initialState: OrdersState = {
  orders: [],
  currentUserId: null,
  isLoading: false,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Initialize orders when user logs in
    initializeOrders: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.currentUserId = userId;
      state.orders = loadOrdersFromStorage(userId);
    },

    // Clear orders when user logs out
    clearOrdersOnLogout: (state) => {
      state.orders = [];
      state.currentUserId = null;
    },

    // Add new order
    addOrder: (state, action: PayloadAction<AddOrderPayload>) => {
      if (!state.currentUserId) return;

      const { orderData, cartItems, deliveryInfo } = action.payload;
      
      const newOrder: Order = {
        id: Date.now().toString(),
        userId: state.currentUserId,
        items: cartItems,
        deliveryInfo: deliveryInfo,
        paymentMethod: orderData.paymentMethod || 'cod',
        totalAmount: orderData.totalAmount,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      };

      state.orders.unshift(newOrder); // Add to beginning of array
      saveOrdersToStorage(state.orders, state.currentUserId);
      
      toast.success('Đặt hàng thành công!', { autoClose: 2000 });
    },

    // Update order status
    updateOrderStatus: (state, action: PayloadAction<UpdateOrderStatusPayload>) => {
      if (!state.currentUserId) return;

      const { orderId, status } = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
        saveOrdersToStorage(state.orders, state.currentUserId);
        
        toast.success("Order status updated successfully!", { autoClose: 2000 });
      }
    },

    // Cancel order
    cancelOrder: (state, action: PayloadAction<string>) => {
      if (!state.currentUserId) return;

      const orderId = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = 'cancelled';
        saveOrdersToStorage(state.orders, state.currentUserId);
        
        toast.success('Hủy đơn hàng thành công!', { autoClose: 2000 });
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  initializeOrders,
  clearOrdersOnLogout,
  addOrder,
  updateOrderStatus,
  cancelOrder,
  setLoading,
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state: RootState): Order[] => state.orders.orders;
export const selectCurrentUserOrders = (state: RootState): Order[] => state.orders.orders;
export const selectOrdersLoading = (state: RootState): boolean => state.orders.isLoading;
export const selectCurrentUserId = (state: RootState): string | null => state.orders.currentUserId;

// Get orders by status
export const selectOrdersByStatus = (status: OrderStatus) => (state: RootState): Order[] =>
  state.orders.orders.filter(order => order.status === status);

// Get order by ID
export const selectOrderById = (orderId: string) => (state: RootState): Order | undefined =>
  state.orders.orders.find(order => order.id === orderId);

// Get recent orders (last 30 days)
export const selectRecentOrders = (state: RootState): Order[] => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return state.orders.orders.filter(order => 
    new Date(order.createdAt) >= thirtyDaysAgo
  );
};

// Get total orders count
export const selectTotalOrdersCount = (state: RootState): number => state.orders.orders.length;

// Get orders total amount
export const selectOrdersTotalAmount = (state: RootState): number =>
  state.orders.orders.reduce((total, order) => total + order.totalAmount, 0);

export default ordersSlice.reducer;
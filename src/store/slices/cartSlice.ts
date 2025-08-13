import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

export interface CartItem {
  [size: string]: number;
}

export interface CartItems {
  [itemId: string]: CartItem;
}

export interface Product {
  _id: string;
  price: number;
  name?: string;
  image?: string;
  description?: string;
}

export interface CartState {
  cartItems: CartItems;
  currentUserId: string | null;
}

export interface AddToCartPayload {
  itemId: string;
  size: string;
}

export interface UpdateQuantityPayload {
  itemId: string;
  size: string;
  quantity: number;
}

export interface RemoveFromCartPayload {
  itemId: string;
  size: string;
}

export interface SelectedItem {
  itemId: string;
  size: string;
}

export interface RootState {
  cart: CartState;
  shop: {
    products: Product[];
  };
}

const loadCartFromStorage = (userId: string | null = null): CartItems => {
  try {
    if (!userId) return {}; // Return empty cart if no user
    const cartKey = `cart_${userId}`;
    const storedCart = localStorage.getItem(cartKey);
    return storedCart ? JSON.parse(storedCart) : {};
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return {};
  }
};

const saveCartToStorage = (cartItems: CartItems, userId: string | null = null): void => {
  try {
    if (!userId) return; // Don't save if no user
    const cartKey = `cart_${userId}`;
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const removeCartFromStorage = (userId: string): void => {
  try {
    if (!userId) return;
    const cartKey = `cart_${userId}`;
    localStorage.removeItem(cartKey);
  } catch (error) {
    console.error('Error removing cart from localStorage:', error);
  }
};

const initialState: CartState = {
  cartItems: {},
  currentUserId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initializeCart: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.currentUserId = userId;
      state.cartItems = loadCartFromStorage(userId);
    },

    clearCartOnLogout: (state) => {
      state.cartItems = {};
      state.currentUserId = null;
    },

    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { itemId, size } = action.payload;
      
      if (!size) {
        toast.error("Select Product Size");
        return;
      }

      if (!state.currentUserId) {
        toast.error("Please log in to add products to your cart.");
        return;
      }

      const cartData = { ...state.cartItems };

      if (cartData[itemId]) {
        if (cartData[itemId][size]) {
          cartData[itemId][size] += 1;
        } else {
          cartData[itemId][size] = 1;
        }
      } else {
        cartData[itemId] = { [size]: 1 };
      }

      state.cartItems = cartData;
      saveCartToStorage(cartData, state.currentUserId);
      
      toast.success("Added to cart successfully!", {
        autoClose: 1500,
      });
    },

    updateQuantity: (state, action: PayloadAction<UpdateQuantityPayload>) => {
      if (!state.currentUserId) return;

      const { itemId, size, quantity } = action.payload;
      
      const cartData = { ...state.cartItems };

      if (quantity === 0) {
        if (cartData[itemId]) {
          delete cartData[itemId][size];
          if (Object.keys(cartData[itemId]).length === 0) {
            delete cartData[itemId];
          }
        }
      } else {
        if (!cartData[itemId]) {
          cartData[itemId] = {};
        }
        cartData[itemId][size] = quantity;
      }

      state.cartItems = cartData;
      saveCartToStorage(cartData, state.currentUserId);
      
      toast.success("Cart updated successfully!", { autoClose: 1500 });
    },

    removeFromCart: (state, action: PayloadAction<RemoveFromCartPayload>) => {
      if (!state.currentUserId) return;

      const { itemId, size } = action.payload;
      const cartData = { ...state.cartItems };

      if (cartData[itemId] && cartData[itemId][size]) {
        delete cartData[itemId][size];
        
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }

      state.cartItems = cartData;
      saveCartToStorage(cartData, state.currentUserId);
    },

    removeSelectedItems: (state, action: PayloadAction<SelectedItem[]>) => {
      if (!state.currentUserId) return;

      const selectedItems = action.payload;
      
      if (selectedItems.length === 0) {
        toast.warning("Vui lòng chọn sản phẩm để xóa!", { autoClose: 1500 });
        return;
      }

      const cartData = { ...state.cartItems };
      
      selectedItems.forEach(item => {
        if (cartData[item.itemId] && cartData[item.itemId][item.size]) {
          delete cartData[item.itemId][item.size];
          
          if (Object.keys(cartData[item.itemId]).length === 0) {
            delete cartData[item.itemId];
          }
        }
      });
      
      state.cartItems = cartData;
      saveCartToStorage(cartData, state.currentUserId);
      
      toast.success(`Removed ${selectedItems.length} products from the cart!`, { autoClose: 1500 });
    },

    clearCart: (state) => {
      if (!state.currentUserId) return;

      if (Object.keys(state.cartItems).length === 0) {
        toast.warning("Cart is empty!", { autoClose: 1500 });
        return;
      }

      state.cartItems = {};
      saveCartToStorage({}, state.currentUserId);
      
      toast.success("All products have been removed from the cart!", { autoClose: 1500 });
    },

    deleteUserCart: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      removeCartFromStorage(userId);
      
      if (state.currentUserId === userId) {
        state.cartItems = {};
      }
    },
  },
});

export const { 
  initializeCart,
  clearCartOnLogout,
  addToCart, 
  updateQuantity, 
  removeFromCart, 
  removeSelectedItems, 
  clearCart,
  deleteUserCart
} = cartSlice.actions;

export const selectCartItems = (state: RootState): CartItems => state.cart.cartItems;
export const selectCurrentUserId = (state: RootState): string | null => state.cart.currentUserId;

export const selectCartCount = (state: RootState): number => {
  if (!state.cart.currentUserId) return 0;
  
  let totalCount = 0;
  const cartItems = state.cart.cartItems;
  
  for (const item in cartItems) {
    for (const size in cartItems[item]) {
      try {
        if (cartItems[item][size] > 0) {
          totalCount += cartItems[item][size];
        }
      } catch (error) {
        console.error('Error calculating cart count:', error);
      }
    }
  }
  return totalCount;
};

export const selectCartAmount = (state: RootState): number => {
  if (!state.cart.currentUserId) return 0;
  
  let totalAmount = 0;
  const cartItems = state.cart.cartItems;
  const products = state.shop.products;
  
  for (const items in cartItems) {
    const itemInfo = products.find((product) => product._id === items);
    if (itemInfo) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (e) {
          console.error('Error calculating cart amount:', e);
        }
      }
    }
  }
  return totalAmount;
};

export const selectSelectedCartAmount = (selectedItems: SelectedItem[]) => (state: RootState): number => {
  if (!selectedItems || selectedItems.length === 0) return 0;
  
  let totalAmount = 0;
  const products = state.shop.products;
  
  selectedItems.forEach(selectedItem => {
    const productData = products.find(product => product._id === selectedItem.itemId);
    if (productData) {
      const cartItem = state.cart.cartItems[selectedItem.itemId]?.[selectedItem.size];
      if (cartItem) {
        totalAmount += productData.price * cartItem;
      }
    }
  });
  
  return totalAmount;
};

export default cartSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { products } from '../../assets/assets';

export type Currency = '$' | '€' | '£' | '¥' | '₫' | string;

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string[] | string;
  category: string;
  subCategory: string;
  sizes: string[];
  date: number;
  bestseller: boolean;
}

export interface ShopState {
  products: Product[];
  currency: Currency;
  delivery_fee: number;
}

export interface RootState {
  shop: ShopState;
}

const initialState: ShopState = {
  products: products,
  currency: '$',
  delivery_fee: 10,
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    
    setCurrency: (state, action: PayloadAction<Currency>) => {
      state.currency = action.payload;
    },
    
    setDeliveryFee: (state, action: PayloadAction<number>) => {
      state.delivery_fee = action.payload;
    },

    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },

    updateProduct: (state, action: PayloadAction<{ id: string; updates: Partial<Product> }>) => {
      const { id, updates } = action.payload;
      const productIndex = state.products.findIndex(product => product._id === id);
      if (productIndex !== -1) {
        state.products[productIndex] = { ...state.products[productIndex], ...updates };
      }
    },

    removeProduct: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.products = state.products.filter(product => product._id !== productId);
    },

    toggleBestseller: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const product = state.products.find(product => product._id === productId);
      if (product) {
        product.bestseller = !product.bestseller;
      }
    },
  },
});

export const { 
  setProducts, 
  setCurrency, 
  setDeliveryFee,
  addProduct,
  updateProduct,
  removeProduct,
  toggleBestseller,
} = shopSlice.actions;

export const selectProducts = (state: RootState): Product[] => state.shop.products;
export const selectCurrency = (state: RootState): Currency => state.shop.currency;
export const selectDeliveryFee = (state: RootState): number => state.shop.delivery_fee;

export const selectProductById = (productId: string) => (state: RootState): Product | undefined =>
  state.shop.products.find(product => product._id === productId);

export const selectProductsByCategory = (category: string) => (state: RootState): Product[] =>
  state.shop.products.filter(product => product.category.toLowerCase() === category.toLowerCase());

export const selectProductsBySubCategory = (subCategory: string) => (state: RootState): Product[] =>
  state.shop.products.filter(product => product.subCategory.toLowerCase() === subCategory.toLowerCase());

export const selectBestsellerProducts = (state: RootState): Product[] =>
  state.shop.products.filter(product => product.bestseller);

export const selectLatestProducts = (limit: number = 10) => (state: RootState): Product[] =>
  state.shop.products
    .sort((a, b) => b.date - a.date)
    .slice(0, limit);

export const selectProductsByPriceRange = (minPrice: number, maxPrice: number) => (state: RootState): Product[] =>
  state.shop.products.filter(product => product.price >= minPrice && product.price <= maxPrice);

export const selectUniqueCategories = (state: RootState): string[] =>
  Array.from(new Set(state.shop.products.map(product => product.category)));

export const selectUniqueSubCategories = (state: RootState): string[] =>
  Array.from(new Set(state.shop.products.map(product => product.subCategory)));

export const selectProductsCount = (state: RootState): number => state.shop.products.length;

export const selectAveragePrice = (state: RootState): number => {
  const products = state.shop.products;
  if (products.length === 0) return 0;
  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
  return totalPrice / products.length;
};

// Search products by name or description
export const selectSearchProducts = (searchTerm: string) => (state: RootState): Product[] => {
  if (!searchTerm.trim()) return state.shop.products;
  
  const term = searchTerm.toLowerCase();
  return state.shop.products.filter(product => 
    product.name.toLowerCase().includes(term) || 
    product.description.toLowerCase().includes(term)
  );
};

// Sort products
export const selectSortedProducts = (sortBy: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc') => 
  (state: RootState): Product[] => {
    const products = [...state.shop.products];
    
    switch (sortBy) {
      case 'price-asc':
        return products.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return products.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return products.sort((a, b) => b.name.localeCompare(a.name));
      case 'date-asc':
        return products.sort((a, b) => a.date - b.date);
      case 'date-desc':
        return products.sort((a, b) => b.date - a.date);
      default:
        return products;
    }
  };

export default shopSlice.reducer;
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string[];
  category: string;
  subCategory: string;
  sizes: string[];
  date: number;
  bestseller: boolean;
}

export interface CartItem {
  [size: string]: number;
}

export interface CartItems {
  [productId: string]: CartItem;
}

export interface CartData {
  _id: string;
  size: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string[];
}

export interface SelectedItem {
  itemId: string;
  size: string;
}

export interface DeliveryInfo {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  _id: string;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  deliveryInfo: DeliveryInfo;
  paymentMethod: string;
  totalAmount: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery: string;
}

export interface Filters {
  category: string[];
  subCategory: string[];
  sortType: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // users: UserWithPassword[];
}

export interface CartState {
  cartItems: CartItems;
  currentUserId: string | null;
}

export interface ShopState {
  products: Product[];
  currency: string;
  delivery_fee: number;
}

export interface UIState {
  search: string;
  showSearch: boolean;
  filters: Filters;
  showFilter: boolean;
}

export interface OrdersState {
  orders: Order[];
  currentUserId: string | null;
  isLoading: boolean;
}

export interface RootState {
  auth: AuthState;
  cart: CartState;
  shop: ShopState;
  ui: UIState;
  orders: OrdersState;
}

export interface ProductItemProps {
  id: string;
  image: string[];
  name: string;
  price: number;
}

export interface TitleProps {
  text1: string;
  text2: string;
}

export interface RelatedProductsProps {
  category: string;
  subCategory: string;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface OrderData {
  paymentMethod: string;
  totalAmount: number;
}

export interface SelectedTotals {
  subtotal: number;
  total: number;
}
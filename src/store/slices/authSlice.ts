import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { AuthState, User, UserWithPassword, LoginCredentials, RegisterData } from '../../types';

// Load user from localStorage
const loadUserFromStorage = (): User | null => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    return null;
  }
};

// Save user to localStorage
const saveUserToStorage = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

// Mock users database
const loadUsersFromStorage = (): UserWithPassword[] => {
  try {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
    return [];
  }
};

const saveUsersToStorage = (users: UserWithPassword[]): void => {
  try {
    localStorage.setItem('users', JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
  isLoading: false,
  error: null,
  users: loadUsersFromStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      saveUserToStorage(action.payload);
      toast.success(`Welcome ${action.payload.name}!`, { autoClose: 2000 });
    },
    
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload;
      // toast.error(action.payload, { autoClose: 3000 });
    },
    
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    registerSuccess: (state, action: PayloadAction<{ user: User; newUser: UserWithPassword }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      state.users.push(action.payload.newUser);
      saveUserToStorage(action.payload.user);
      saveUsersToStorage(state.users);
      toast.success('Registration successful!', { autoClose: 2000 });
    },
    
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      toast.error(action.payload, { autoClose: 3000 });
    },
    
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      saveUserToStorage(null);
      toast.success("Logout successful!", { autoClose: 2000 });
    },
    
    clearError: (state) => {
      state.error = null;
    },
    

updateProfile: (state, action: PayloadAction<Partial<User>>) => {
  if (state.user) {
    const updatedData = { ...state.user, ...action.payload };
    
    // tên update -> avt update theo
    if (action.payload.name && action.payload.name !== state.user.name) {
      updatedData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(action.payload.name)}&background=000&color=fff`;
    }
    
    state.user = updatedData;
    saveUserToStorage(state.user);
    
    // Cập nhật trong users array
    const userIndex = state.users.findIndex(u => u.id === state.user!.id);
    if (userIndex !== -1) {
      state.users[userIndex] = { ...state.users[userIndex], ...updatedData };
      saveUsersToStorage(state.users);
    }
    
    toast.success("Information updated successfully!", { autoClose: 2000 });
  }
},
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure,
  registerStart,
  registerSuccess, 
  registerFailure,
  logout, 
  clearError,
  updateProfile
} = authSlice.actions;

export const loginUser = (credentials: LoginCredentials) => (dispatch: any, getState: any) => {
  dispatch(loginStart());
  setTimeout(() => {
    const { users } = getState().auth;
    const user = users.find(
      (u: UserWithPassword) => u.email === credentials.email && u.password === credentials.password
    );
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      dispatch(loginSuccess(userWithoutPassword));
      
      dispatch({ type: 'cart/initializeCart', payload: user.id });
      dispatch({ type: 'orders/initializeOrders', payload: user.id });
    } else {
      dispatch(loginFailure("Email or password is incorrect."));
    }
  }, 1000);
};

export const registerUser = (userData: RegisterData) => (dispatch: any, getState: any) => {
  dispatch(registerStart());
  
  setTimeout(() => {
    const { users } = getState().auth;
    
    const existingUser = users.find((u: UserWithPassword) => u.email === userData.email);
    
    if (existingUser) {
      dispatch(registerFailure("Email has already been used."));
      return;
    }
    
    const newUser: UserWithPassword = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=000&color=fff`,
    };
    
    const { password, ...userWithoutPassword } = newUser;
    
    dispatch(registerSuccess({
      user: userWithoutPassword,
      newUser: newUser,
    }));
    
    dispatch({ type: 'cart/initializeCart', payload: newUser.id });
    dispatch({ type: 'orders/initializeOrders', payload: newUser.id });
  }, 1000);
};

export const initializeApp = () => (dispatch: any, getState: any) => {
  const { user, isAuthenticated } = getState().auth;
  
  if (isAuthenticated && user?.id) {
    dispatch({ type: 'cart/initializeCart', payload: user.id });
    dispatch({ type: 'orders/initializeOrders', payload: user.id });
  } else {
    dispatch({ type: 'cart/clearCartOnLogout' });
    dispatch({ type: 'orders/clearOrdersOnLogout' });
  }
};

export const logoutUser = () => (dispatch: any) => {
  dispatch({ type: 'cart/clearCartOnLogout' });
  dispatch({ type: 'orders/clearOrdersOnLogout' });
  
  dispatch(logout());
};

export const selectUser = (state: any) => state.auth.user;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectIsLoading = (state: any) => state.auth.isLoading;
export const selectError = (state: any) => state.auth.error;

export default authSlice.reducer;
// src/pages/Login.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from "react-router-dom";
import { 
  loginUser, 
  registerUser, 
  clearError,
  selectIsLoading,
  selectError,
  selectIsAuthenticated 
} from '../store/slices/authSlice';
import { RegisterFormData, LoginFormData } from '../types';

type AuthState = 'Login' | 'Sign Up';

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const [currentState, setCurrentState] = useState<AuthState>('Login');
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Validation rules
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) return 'Name can only contain letters and spaces';
        return undefined;
        
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return undefined;
        
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (currentState === 'Sign Up') {
          if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
          if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
          if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        }
        return undefined;
        
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (currentState === 'Sign Up') {
      const nameError = validateField('name', formData.name);
      if (nameError) errors.name = nameError;
    }
    
    const emailError = validateField('email', formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validateField('password', formData.password);
    if (passwordError) errors.password = passwordError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear error when component unmounts or state changes
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearError());
    setValidationErrors({});
    setTouched({});
  }, [currentState, dispatch]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation for touched fields
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldError = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    // Mark all fields as touched
    const touchedFields: {[key: string]: boolean} = {
      email: true,
      password: true
    };
    if (currentState === 'Sign Up') {
      touchedFields.name = true;
    }
    setTouched(touchedFields);

    // Validate form
    if (!validateForm()) {
      return;
    }
    
    if (currentState === 'Login') {
      const loginData: LoginFormData = {
        email: formData.email.trim(),
        password: formData.password
      };
      dispatch(loginUser(loginData));
    } else {
      const registerData: RegisterFormData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      };
      dispatch(registerUser(registerData));
    }
  };

  const toggleState = (): void => {
    setCurrentState(prev => prev === 'Login' ? 'Sign Up' : 'Login');
    setFormData({ name: '', email: '', password: '' });
    setValidationErrors({});
    setTouched({});
  };

  const getInputClassName = (fieldName: string): string => {
    const hasError = touched[fieldName] && validationErrors[fieldName];
    return `w-full px-3 py-2 border transition-colors ${
      hasError 
        ? 'border-red-500 focus:border-red-500 bg-red-50' 
        : 'border-gray-800 focus:border-blue-500 focus:bg-blue-50'
    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`;
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {/* Server Error Message */}
      {error && (
        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        {/* Name Field - Only show for Sign Up */}
        {currentState === 'Sign Up' && (
          <div className="mb-4">
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={getInputClassName('name')}
              placeholder="Full Name"
              disabled={isLoading}
            />
            {touched.name && validationErrors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">❌</span>
                {validationErrors.name}
              </p>
            )}
          </div>
        )}

        {/* Email Field */}
        <div className="mb-4">
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={getInputClassName('email')}
            placeholder="Email"
            disabled={isLoading}
          />
          {touched.email && validationErrors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <span className="mr-1">❌</span>
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-2">
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={getInputClassName('password')}
            placeholder="Password"
            disabled={isLoading}
          />
          {touched.password && validationErrors.password && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <span className="mr-1">❌</span>
              {validationErrors.password}
            </p>
          )}
          {currentState === 'Sign Up' && !validationErrors.password && (
            <div className="text-xs text-gray-500 mt-1">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                  At least 6 characters
                </li>
                <li className={/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : ''}>
                  One lowercase letter
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : ''}>
                  One uppercase letter
                </li>
                <li className={/(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''}>
                  One number
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex w-full justify-between text-sm mb-4">
          <p className="cursor-pointer hover:text-blue-600">
            {currentState === "Login" ? "Forgot password?" : ""}
          </p>
          <p onClick={toggleState} className="cursor-pointer hover:text-blue-600 font-medium">
            {currentState === "Login" ? "Create account" : "Login"}
          </p>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className={`w-full font-light px-8 py-3 text-white transition-all duration-200 rounded-md ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-black hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {currentState === 'Login' ? 'Logging in...' : 'Signing up...'}
            </div>
          ) : (
            <>
              {currentState === 'Login' ? '🔑 Login' : '✨ Create Account'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
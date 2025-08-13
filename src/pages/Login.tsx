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
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Validation
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
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (currentState === 'Sign Up') {
          if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
          if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
          if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
          if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) return 'Password must contain at least one special character (!@#$%^&*...)';
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

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearError());
    setValidationErrors({});
    setTouched({});
    setShowPassword(false); // Reset password visibility when switching forms
  }, [currentState, dispatch]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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
    
    const touchedFields: {[key: string]: boolean} = {
      email: true,
      password: true
    };
    if (currentState === 'Sign Up') {
      touchedFields.name = true;
    }
    setTouched(touchedFields);

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
    setShowPassword(false);
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(prev => !prev);
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

      {error && (
        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
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

        {/* Password Field with Toggle */}
        <div className="mb-2">
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`${getInputClassName('password')} pr-12`}
              placeholder="Password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors ${
                isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // Eye slash icon (hide)
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" 
                  />
                </svg>
              ) : (
                // Eye icon (show)
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                  />
                </svg>
              )}
            </button>
          </div>
          
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
                <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                  At least 8 characters
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
                <li className={/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password) ? 'text-green-600' : ''}>
                  One special character (!@#$%^&*...)
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
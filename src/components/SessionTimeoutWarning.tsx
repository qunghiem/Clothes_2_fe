import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { useAutoLogoutContext } from './AutoLogoutProvider';

export const SessionTimeoutWarning: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { resetTimer, getRemainingTime, isWarningShown } = useAutoLogoutContext();
  
  const [countdown, setCountdown] = useState(30);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isWarningShown && isAuthenticated) {
      setShowModal(true);
      setCountdown(30);

      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowModal(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
      };
    } else {
      setShowModal(false);
    }
  }, [isWarningShown, isAuthenticated]);

  const handleStayLoggedIn = () => {
    resetTimer();
    setShowModal(false);
  };

  if (!showModal || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
            <svg 
              className="w-8 h-8 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Session Timeout Warning
          </h3>

          <p className="text-gray-600 text-center mb-6">
            Your session will expire in <span className="font-bold text-red-600">{countdown}</span> seconds due to inactivity. 
            You will be automatically logged out.
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 30) * 100}%` }}
            ></div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStayLoggedIn}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Stay Logged In
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Let Me Logout
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Click "Stay Logged In" to extend your session or continue browsing to stay active.
          </p>
        </div>
      </div>
    </>
  );
};
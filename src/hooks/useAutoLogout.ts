// src/hooks/useAutoLogout.ts
import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectIsAuthenticated, logoutUser } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

// Thời gian timeout (5 phút = 300,000ms)
const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes
// Thời gian cảnh báo trước khi logout (30 giây)
const WARNING_DURATION = 30 * 1000; // 30 seconds

interface UseAutoLogoutOptions {
  timeoutDuration?: number;
  warningDuration?: number;
  showWarning?: boolean;
  onWarning?: () => void;
  onLogout?: () => void;
}

export const useAutoLogout = (options: UseAutoLogoutOptions = {}) => {
  const {
    timeoutDuration = TIMEOUT_DURATION,
    warningDuration = WARNING_DURATION,
    showWarning = true,
    onWarning,
    onLogout
  } = options;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Danh sách các event cần theo dõi để phát hiện user activity
  const events = [
    'mousedown',
    'mousemove', 
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ];

  // Function để logout user
  const performLogout = useCallback(() => {
    if (isAuthenticated) {
      dispatch(logoutUser());
      navigate('/login');
      toast.warning('You have been automatically logged out due to inactivity.', {
        autoClose: 5000,
        position: 'top-center'
      });
      onLogout?.();
    }
  }, [dispatch, navigate, isAuthenticated, onLogout]);

  // Function để hiển thị cảnh báo
  const showWarningMessage = useCallback(() => {
    if (showWarning && isAuthenticated) {
      toast.warning(`You will be logged out in ${warningDuration / 1000} seconds due to inactivity.`, {
        autoClose: warningDuration - 2000, // Show toast for warning duration minus 2 seconds
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      onWarning?.();
    }
  }, [showWarning, warningDuration, isAuthenticated, onWarning]);

  // Function để reset timer
  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    const now = Date.now();
    lastActivityRef.current = now;

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timer (shows warning before logout)
    if (showWarning) {
      warningTimeoutRef.current = setTimeout(() => {
        showWarningMessage();
      }, timeoutDuration - warningDuration);
    }

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      performLogout();
    }, timeoutDuration);
  }, [isAuthenticated, timeoutDuration, warningDuration, showWarning, showWarningMessage, performLogout]);

  // Function để handle user activity
  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Setup và cleanup event listeners
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timers nếu user không được authenticate
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      return;
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start timer
    resetTimer();

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isAuthenticated, handleActivity, resetTimer]);

  // Handle visibility change (when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isAuthenticated) return;

      if (document.hidden) {
        // Tab is hidden, pause the timer by storing current timestamp
        lastActivityRef.current = Date.now();
      } else {
        // Tab is visible again, check if we should logout
        const timeAwayFromTab = Date.now() - lastActivityRef.current;
        
        if (timeAwayFromTab >= timeoutDuration) {
          // User was away longer than timeout duration
          performLogout();
        } else {
          // Reset timer with remaining time
          resetTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, timeoutDuration, performLogout, resetTimer]);

  // Return utility functions
  return {
    resetTimer,
    getRemainingTime: () => {
      if (!isAuthenticated) return 0;
      const elapsed = Date.now() - lastActivityRef.current;
      return Math.max(0, timeoutDuration - elapsed);
    },
    getLastActivity: () => lastActivityRef.current,
    isTimerActive: () => !!timeoutRef.current,
  };
};
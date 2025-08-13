import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectIsAuthenticated, logoutUser } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes
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

  const events = [
    'mousedown',
    'mousemove', 
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ];

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

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    const now = Date.now();
    lastActivityRef.current = now;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (showWarning) {
      warningTimeoutRef.current = setTimeout(() => {
        showWarningMessage();
      }, timeoutDuration - warningDuration);
    }

    timeoutRef.current = setTimeout(() => {
      performLogout();
    }, timeoutDuration);
  }, [isAuthenticated, timeoutDuration, warningDuration, showWarning, showWarningMessage, performLogout]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) {
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

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    resetTimer();

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isAuthenticated) return;

      if (document.hidden) {
        lastActivityRef.current = Date.now();
      } else {
        const timeAwayFromTab = Date.now() - lastActivityRef.current;
        
        if (timeAwayFromTab >= timeoutDuration) {
          performLogout();
        } else {
          resetTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, timeoutDuration, performLogout, resetTimer]);

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
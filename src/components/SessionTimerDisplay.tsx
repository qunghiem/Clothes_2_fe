import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { useAutoLogoutContext } from './AutoLogoutProvider';

interface SessionTimerDisplayProps {
  className?: string;
  showOnlyWarning?: boolean; 
  warningThreshold?: number; 
}

export const SessionTimerDisplay: React.FC<SessionTimerDisplayProps> = ({
  className = '',
  showOnlyWarning = false,
  warningThreshold = 60 * 1000 
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { getRemainingTime, resetTimer } = useAutoLogoutContext();
  
  const [remainingTime, setRemainingTime] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsVisible(false);
      return;
    }

    const updateTimer = () => {
      const remaining = getRemainingTime();
      setRemainingTime(remaining);
      
      if (showOnlyWarning) {
        setIsVisible(remaining <= warningThreshold && remaining > 0);
      } else {
        setIsVisible(remaining > 0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, getRemainingTime, showOnlyWarning, warningThreshold]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getColorClass = (): string => {
    if (remainingTime <= 30 * 1000) { 
      return 'text-red-600 bg-red-100';
    } else if (remainingTime <= 60 * 1000) { 
      return 'text-orange-600 bg-orange-100';
    } else if (remainingTime <= 2 * 60 * 1000) { 
      return 'text-yellow-600 bg-yellow-100';
    }
    return 'text-green-600 bg-green-100';
  };

  const handleExtendSession = () => {
    resetTimer();
  };

  if (!isVisible || !isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${getColorClass()} ${className}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      
      <span className="font-medium">
        {formatTime(remainingTime)}
      </span>
      
      {remainingTime <= 2 * 60 * 1000 && (
        <button
          onClick={handleExtendSession}
          className="ml-1 text-xs underline hover:no-underline"
          title="Extend session"
        >
          Extend
        </button>
      )}
    </div>
  );
};

export const SessionWarningIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { getRemainingTime } = useAutoLogoutContext();
  
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    const checkWarning = () => {
      const remaining = getRemainingTime();
      setShowWarning(remaining <= 60 * 1000 && remaining > 0); // Show warning when less than 1 minute
    };

    checkWarning();
    const interval = setInterval(checkWarning, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, getRemainingTime]);

  if (!showWarning || !isAuthenticated) {
    return null;
  }

  return (
    <div className={`animate-pulse ${className}`}>
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
        />
      </svg>
    </div>
  );
};
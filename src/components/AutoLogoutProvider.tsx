import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAutoLogout } from '../hooks/useAutoLogout';

interface AutoLogoutContextType {
  resetTimer: () => void;
  getRemainingTime: () => number;
  getLastActivity: () => number;
  isTimerActive: () => boolean;
  isWarningShown: boolean;
}

const AutoLogoutContext = createContext<AutoLogoutContextType | undefined>(undefined);

export const useAutoLogoutContext = () => {
  const context = useContext(AutoLogoutContext);
  if (!context) {
    throw new Error('useAutoLogoutContext must be used within AutoLogoutProvider');
  }
  return context;
};

interface AutoLogoutProviderProps {
  children: React.ReactNode;
  timeoutDuration?: number; 
  warningDuration?: number;
  showWarning?: boolean;
}

export const AutoLogoutProvider: React.FC<AutoLogoutProviderProps> = ({
  children,
  timeoutDuration = 5 * 60 * 1000, // 5 phút
  warningDuration = 30 * 1000, // 30 giây
  showWarning = true
}) => {
  const [isWarningShown, setIsWarningShown] = useState(false);

  const { resetTimer, getRemainingTime, getLastActivity, isTimerActive } = useAutoLogout({
    timeoutDuration,
    warningDuration,
    showWarning,
    onWarning: () => {
      setIsWarningShown(true);
      
      setTimeout(() => {
        setIsWarningShown(false);
      }, warningDuration);
    },
    onLogout: () => {
      setIsWarningShown(false);
    }
  });

  const value: AutoLogoutContextType = {
    resetTimer,
    getRemainingTime,
    getLastActivity,
    isTimerActive,
    isWarningShown
  };

  return (
    <AutoLogoutContext.Provider value={value}>
      {children}
    </AutoLogoutContext.Provider>
  );
};
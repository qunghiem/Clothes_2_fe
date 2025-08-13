import React, { useState, useEffect } from 'react';

interface ChatbotButtonProps {
  onClick: () => void;
  isOpen: boolean;
  hasNewMessage?: boolean;
}

export const ChatbotButton: React.FC<ChatbotButtonProps> = ({ 
  onClick, 
  isOpen, 
  hasNewMessage = false 
}) => {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const hasUsedChatbot = localStorage.getItem('chatbot_used');
    if (!hasUsedChatbot && !isOpen) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClick = () => {
    localStorage.setItem('chatbot_used', 'true');
    setIsPulsing(false);
    onClick();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isPulsing && !isOpen && (
        <>
          <div className="absolute inset-0 w-14 h-14 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-0 w-14 h-14 bg-blue-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.5s' }}></div>
        </>
      )}
      
      <button
        onClick={handleClick}
        className={`relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-180' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white flex items-center justify-center group`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <div className={`transition-all duration-300 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>

        <div className={`absolute transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        {hasNewMessage && !isOpen && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        )}

        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          {isOpen ? 'Close chat' : 'Need help? Chat with us!'}
          <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </button>
    </div>
  );
};
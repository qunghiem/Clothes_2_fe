import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useChatbot, ChatMessage } from '../hooks/useChatbot';
import { selectCurrency } from '../store/slices/shopSlice';
import { ChatbotButton } from './ChatbotButton';

export const EnhancedChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { messages, isTyping, sendMessage, clearMessages } = useChatbot();
  const currency = useSelector(selectCurrency);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleQuickMessage = (message: string) => {
    sendMessage(message);
  };

  const renderMessage = (message: ChatMessage) => (
    <div
      key={message.id}
      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-4 group`}
    >
      <div className={`max-w-xs lg:max-w-md ${message.isBot ? 'order-2' : 'order-1'}`}>
        {message.isBot && (
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs">🤖</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">Assistant</span>
          </div>
        )}
        
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            message.isBot
              ? 'bg-gray-100 text-gray-800 rounded-tl-md'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-md'
          }`}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</div>
          
          {message.products && message.products.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs text-gray-600 font-medium mb-2">
                💡 Recommended products:
              </div>
              {message.products.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="relative">
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-lg mr-3"
                    />
                    {product.bestseller && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        🔥
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      {currency}{product.price}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {product.category} • {product.subCategory}
                    </p>
                  </div>
                  <div className="text-blue-500 group-hover:translate-x-1 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.timestamp)}
        </div>
      </div>
      
      {!message.isBot && (
        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center ml-2 order-2">
          <span className="text-white text-xs">👤</span>
        </div>
      )}
    </div>
  );

  const quickSuggestions = [
    { text: '🔥 Best sellers', message: 'Show me best sellers' },
    { text: '👕 Men\'s clothing', message: 'Men\'s clothing' },
    { text: '👗 Women\'s clothing', message: 'Women\'s clothing' },
    { text: '✨ Latest arrivals', message: 'Latest arrivals' },
    { text: '💰 Budget friendly', message: 'Show me cheap products' },
    { text: '❓ Help', message: 'Help me find something' },
  ];

  return (
    <>
      <ChatbotButton 
        onClick={() => setIsOpen(!isOpen)} 
        isOpen={isOpen}
        hasNewMessage={messages.length === 1 && !localStorage.getItem('chatbot_used')}
      />

      {isOpen && (
        <div className={`fixed bottom-20 right-4 z-40 bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? 'w-80 h-14' : 'w-80 h-[32rem]'
        } flex flex-col overflow-hidden`}>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Shopping Assistant</h3>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  <p className="text-xs opacity-90">
                    {isTyping ? 'Typing...' : 'Online'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                title={isMinimized ? 'Expand chat' : 'Minimize chat'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? "M7 14l5-5 5 5" : "M17 10l-5 5-5-5"} />
                </svg>
              </button>
              <button
                onClick={clearMessages}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                title="Clear chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white custom-scrollbar">
                {messages.map(renderMessage)}
                
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="max-w-xs">
                      <div className="flex items-center mb-1">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs">🤖</span>
                        </div>
                        <span className="text-xs text-gray-500">Assistant is thinking...</span>
                      </div>
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-md">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {messages.length <= 2 && (
                <div className="px-4 py-3 border-t bg-gray-50">
                  <p className="text-xs text-gray-600 mb-3 font-medium">💡 Quick suggestions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickMessage(suggestion.message)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
                      >
                        {suggestion.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 border-t bg-white">
                <div className="flex space-x-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about our products..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Press Enter to send • Ask about products, prices, sizes, and more!
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};
import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectProducts, selectCurrency } from '../store/slices/shopSlice';
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import { Product } from '../types';

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  products?: Product[];
  messageType?: 'text' | 'product' | 'greeting' | 'help';
}

interface ChatbotResponse {
  text: string;
  products?: Product[];
  messageType?: 'text' | 'product' | 'greeting' | 'help';
}

interface ChatSession {
  sessionId: string;
  startTime: Date;
  messageCount: number;
  userPreferences: {
    preferredCategory?: string;
    priceRange?: { min: number; max: number };
    lastSearchedItems: string[];
  };
}

export const useAdvancedChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [userContext, setUserContext] = useState<{
    lastCategory?: string;
    searchHistory: string[];
    preferredPriceRange?: { min: number; max: number };
  }>({
    searchHistory: [],
  });

  const products = useSelector(selectProducts);
  const currency = useSelector(selectCurrency);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Initialize chat session
  useEffect(() => {
    const newSession: ChatSession = {
      sessionId: Date.now().toString(),
      startTime: new Date(),
      messageCount: 0,
      userPreferences: {
        lastSearchedItems: [],
      },
    };
    setSession(newSession);

    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('chatbot_history');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages.slice(-10)); // Keep last 10 messages
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }

    // Set initial greeting
    if (!savedMessages || JSON.parse(savedMessages).length === 0) {
      const greeting = getPersonalizedGreeting();
      setMessages([greeting]);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot_history', JSON.stringify(messages));
    }
  }, [messages]);

  const getPersonalizedGreeting = (): ChatMessage => {
    const currentHour = new Date().getHours();
    let timeGreeting = '';
    
    if (currentHour < 12) timeGreeting = 'Good morning';
    else if (currentHour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    const userName = user?.name ? `, ${user.name.split(' ')[0]}` : '';
    
    return {
      id: '1',
      text: `${timeGreeting}${userName}! 👋 I'm your personal shopping assistant. I can help you find the perfect products, check prices, answer questions about our store, and much more. What can I help you with today?`,
      isBot: true,
      timestamp: new Date(),
      messageType: 'greeting',
    };
  };

  const updateUserContext = (searchTerm: string, category?: string) => {
    setUserContext(prev => ({
      ...prev,
      lastCategory: category || prev.lastCategory,
      searchHistory: [searchTerm, ...prev.searchHistory.slice(0, 4)], // Keep last 5 searches
    }));
  };

  const findSimilarProducts = (searchTerms: string[]): Product[] => {
    const allMatches = new Set<Product>();
    
    searchTerms.forEach(term => {
      const matches = products.filter(product => 
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description.toLowerCase().includes(term.toLowerCase()) ||
        product.category.toLowerCase().includes(term.toLowerCase()) ||
        product.subCategory.toLowerCase().includes(term.toLowerCase())
      );
      matches.forEach(match => allMatches.add(match));
    });

    return Array.from(allMatches);
  };

  const generateResponse = useCallback((userMessage: string): ChatbotResponse => {
    const message = userMessage.toLowerCase().trim();
    
    // Update session
    if (session) {
      setSession(prev => prev ? {
        ...prev,
        messageCount: prev.messageCount + 1,
      } : null);
    }

    // Advanced greeting responses
    if (message.match(/^(hi|hello|hey|good morning|good afternoon|good evening|start|begin)/)) {
      const responses = [
        "Hello there! 😊 I'm excited to help you find amazing products today!",
        "Hi! 👋 Welcome back! Ready to discover some great deals?",
        "Hey! Great to see you! What brings you to our store today?",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      return {
        text: `${randomResponse} ${userContext.searchHistory.length > 0 ? 
          `\n\nI noticed you were looking at ${userContext.searchHistory[0]} before. Want to continue exploring similar items?` : 
          'Feel free to ask me anything about our products!'
        }`,
        messageType: 'greeting'
      };
    }

    // Goodbye responses
    if (message.match(/(bye|goodbye|see you|thanks|thank you|thats all|done|finished)/)) {
      const responses = [
        "Thank you for shopping with us! 😊 Have a wonderful day!",
        "It was great helping you today! Come back anytime! 🛍️",
        "Goodbye! Don't forget to check out our latest arrivals! ✨",
      ];
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
        messageType: 'text'
      };
    }

    // User account specific queries
    if (isAuthenticated && (message.includes('my account') || message.includes('my orders') || message.includes('profile'))) {
      return {
        text: `Hi ${user?.name}! 👤 I can see you're logged in. You can check your orders, update your profile, or view your cart. Is there something specific you'd like help with regarding your account?`,
        messageType: 'text'
      };
    }

    // Smart product search with context
    if (message.includes('find') || message.includes('search') || message.includes('looking for') || message.includes('show me')) {
      let searchTerms = message.replace(/(find|search|looking for|show me|i want|i need|get me|display)/g, '').trim();
      
      // Enhanced search with price context
      let priceFilter: { min?: number; max?: number } = {};
      if (message.includes('under') || message.includes('less than') || message.includes('below')) {
        const priceMatch = message.match(/(\d+)/);
        if (priceMatch) {
          priceFilter.max = parseInt(priceMatch[1]);
        }
      }
      
      if (message.includes('over') || message.includes('more than') || message.includes('above')) {
        const priceMatch = message.match(/(\d+)/);
        if (priceMatch) {
          priceFilter.min = parseInt(priceMatch[1]);
        }
      }

      if (searchTerms) {
        updateUserContext(searchTerms);
        
        let foundProducts = products.filter(product => 
          product.name.toLowerCase().includes(searchTerms) ||
          product.description.toLowerCase().includes(searchTerms) ||
          product.category.toLowerCase().includes(searchTerms) ||
          product.subCategory.toLowerCase().includes(searchTerms)
        );

        // Apply price filter
        if (priceFilter.min !== undefined) {
          foundProducts = foundProducts.filter(p => p.price >= priceFilter.min!);
        }
        if (priceFilter.max !== undefined) {
          foundProducts = foundProducts.filter(p => p.price <= priceFilter.max!);
        }

        if (foundProducts.length > 0) {
          const priceText = priceFilter.min || priceFilter.max ? 
            ` in your price range (${priceFilter.min ? `over ${currency}${priceFilter.min}` : ''}${priceFilter.min && priceFilter.max ? ' and ' : ''}${priceFilter.max ? `under ${currency}${priceFilter.max}` : ''})` : '';
          
          return {
            text: `Perfect! I found ${foundProducts.length} product(s) matching "${searchTerms}"${priceText}. Here are some great options:`,
            products: foundProducts.slice(0, 8),
            messageType: 'product'
          };
        } else {
          // Suggest similar products
          const similarTerms = searchTerms.split(' ');
          const similarProducts = findSimilarProducts(similarTerms);
          
          if (similarProducts.length > 0) {
            return {
              text: `I couldn't find exact matches for "${searchTerms}", but here are some similar products you might like:`,
              products: similarProducts.slice(0, 6),
              messageType: 'product'
            };
          }
          
          return {
            text: `Sorry, I couldn't find products matching "${searchTerms}"${priceFilter.min || priceFilter.max ? ' in that price range' : ''}. Try searching for:\n• Categories: men, women, kids\n• Types: shirts, pants, jackets\n• Or ask me "what do you have?" to see all options! 🔍`,
            messageType: 'text'
          };
        }
      }
    }

    // Enhanced category responses with personalization
    const categoryResponses = {
      men: () => {
        const menProducts = products.filter(p => p.category.toLowerCase() === 'men');
        updateUserContext('men\'s clothing', 'men');
        return {
          text: `Great choice! We have ${menProducts.length} products for men. Here are some popular items:`,
          products: menProducts.slice(0, 6),
          messageType: 'product'
        };
      },
      women: () => {
        const womenProducts = products.filter(p => p.category.toLowerCase() === 'women');
        updateUserContext('women\'s clothing', 'women');
        return {
          text: `Excellent! We have ${womenProducts.length} beautiful products for women. Check these out:`,
          products: womenProducts.slice(0, 6),
          messageType: 'product'
        };
      },
      kids: () => {
        const kidsProducts = products.filter(p => p.category.toLowerCase() === 'kids');
        updateUserContext('kids clothing', 'kids');
        return {
          text: `Aww! We have ${kidsProducts.length} adorable products for kids. Here are some favorites:`,
          products: kidsProducts.slice(0, 6),
          messageType: 'product'
        };
      }
    };

    // Check for category mentions
    if (message.includes('men') || message.includes('male')) {
      return categoryResponses.men();
    }
    if (message.includes('women') || message.includes('female') || message.includes('ladies')) {
      return categoryResponses.women();
    }
    if (message.includes('kids') || message.includes('children') || message.includes('child')) {
      return categoryResponses.kids();
    }

    // Enhanced product type queries
    const productTypeQueries = {
      topwear: ['shirt', 'top', 'topwear', 'blouse', 't-shirt', 'tshirt'],
      bottomwear: ['pant', 'bottom', 'bottomwear', 'trouser', 'jeans', 'shorts'],
      winterwear: ['winter', 'jacket', 'coat', 'winterwear', 'sweater', 'hoodie']
    };

    for (const [type, keywords] of Object.entries(productTypeQueries)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        const typeProducts = products.filter(p => 
          p.subCategory.toLowerCase() === type ||
          keywords.some(k => p.name.toLowerCase().includes(k))
        );
        updateUserContext(type);
        
        const typeNames = {
          topwear: 'top wear',
          bottomwear: 'bottom wear',
          winterwear: 'winter wear'
        };
        
        return {
          text: `Here are our ${typeNames[type as keyof typeof typeNames]} products:`,
          products: typeProducts.slice(0, 6),
          messageType: 'product'
        };
      }
    }

    // Smart recommendations based on user context
    if (message.includes('recommend') || message.includes('suggest') || message.includes('what should')) {
      let recommendedProducts: Product[] = [];
      let recommendationText = '';

      if (userContext.lastCategory) {
        recommendedProducts = products.filter(p => 
          p.category.toLowerCase() === userContext.lastCategory && p.bestseller
        );
        recommendationText = `Based on your interest in ${userContext.lastCategory}'s clothing, here are my top recommendations:`;
      } else {
        recommendedProducts = products.filter(p => p.bestseller);
        recommendationText = 'Here are my top recommendations - our best sellers that customers love:';
      }

      return {
        text: recommendationText,
        products: recommendedProducts.slice(0, 6),
        messageType: 'product'
      };
    }

    // Best sellers with context
    if (message.includes('best') || message.includes('popular') || message.includes('trending') || message.includes('bestseller')) {
      const bestSellers = products.filter(p => p.bestseller);
      return {
        text: `🔥 Here are our best-selling products that customers absolutely love:`,
        products: bestSellers.slice(0, 6),
        messageType: 'product'
      };
    }

    // Latest products with enhanced response
    if (message.includes('latest') || message.includes('new') || message.includes('recent') || message.includes('fresh')) {
      const latestProducts = products.sort((a, b) => b.date - a.date);
      return {
        text: `✨ Check out our latest arrivals - fresh styles just in:`,
        products: latestProducts.slice(0, 6),
        messageType: 'product'
      };
    }

    // Enhanced price queries
    if (message.includes('price') || message.includes('cost') || message.includes('cheap') || message.includes('expensive') || message.includes('budget')) {
      const priceRanges = {
        budget: products.filter(p => p.price <= 50).sort((a, b) => a.price - b.price),
        mid: products.filter(p => p.price > 50 && p.price <= 100),
        premium: products.filter(p => p.price > 100).sort((a, b) => b.price - a.price)
      };

      if (message.includes('cheap') || message.includes('affordable') || message.includes('budget')) {
        return {
          text: `💰 Here are our most budget-friendly products (under ${currency}50):`,
          products: priceRanges.budget.slice(0, 6),
          messageType: 'product'
        };
      }
      
      if (message.includes('expensive') || message.includes('premium') || message.includes('luxury') || message.includes('high-end')) {
        return {
          text: `💎 Here are our premium products for those who want the best:`,
          products: priceRanges.premium.slice(0, 6),
          messageType: 'product'
        };
      }

      const minPrice = Math.min(...products.map(p => p.price));
      const maxPrice = Math.max(...products.map(p => p.price));
      
      return {
        text: `💰 Our products range from ${currency}${minPrice} to ${currency}${maxPrice}.\n\n🏷️ Price categories:\n• Budget: Under ${currency}50 (${priceRanges.budget.length} items)\n• Mid-range: ${currency}50-100 (${priceRanges.mid.length} items)\n• Premium: Over ${currency}100 (${priceRanges.premium.length} items)\n\nWhich range interests you?`,
        messageType: 'text'
      };
    }

    // Enhanced size queries
    if (message.includes('size') || message.includes('sizes') || message.includes('fit')) {
      const allSizes = [...new Set(products.flatMap(p => p.sizes))].sort();
      const sizeChart = {
        'XS': 'Extra Small',
        'S': 'Small', 
        'M': 'Medium',
        'L': 'Large',
        'XL': 'Extra Large',
        'XXL': 'Double Extra Large'
      };
      
      return {
        text: `📏 We offer these sizes: ${allSizes.join(', ')}\n\n👕 Size guide:\n${allSizes.map(size => `• ${size}: ${sizeChart[size as keyof typeof sizeChart] || size}`).join('\n')}\n\nEach product page shows available sizes. Need help with sizing? Just ask! 📋`,
        messageType: 'text'
      };
    }

    // Comprehensive help with context
    if (message.includes('help') || message.includes('support') || message.includes('assist') || message.includes('what can you do')) {
      const helpText = `🤖 I'm your personal shopping assistant! Here's how I can help:\n\n🔍 **Product Search:**\n• "Show me men's shirts"\n• "Find red dresses under $50"\n• "Latest winter jackets"\n\n📊 **Browse Categories:**\n• Men's, Women's, Kids clothing\n• Shirts, Pants, Jackets\n• Best sellers, New arrivals\n\n💰 **Price & Info:**\n• Compare prices\n• Size guides\n• Product details\n\n🛍️ **Store Services:**\n• Shipping info\n• Return policy\n• Contact details\n\n${userContext.searchHistory.length > 0 ? `\n🕒 **Your Recent Searches:**\n${userContext.searchHistory.slice(0, 3).map(item => `• ${item}`).join('\n')}` : ''}\n\nJust type what you're looking for! 😊`;

      return {
        text: helpText,
        messageType: 'help'
      };
    }

    // Enhanced shipping and delivery
    if (message.includes('shipping') || message.includes('delivery') || message.includes('ship')) {
      return {
        text: `🚚 **Shipping Information:**\n\n📦 Delivery fee: ${currency}10\n⏰ Delivery time: 5-7 business days\n💵 Cash on delivery available\n🆓 Free shipping on orders over ${currency}100\n🌍 We ship nationwide\n📍 Express delivery available in major cities\n\nNeed to track an order? I can help with that too! 📋`,
        messageType: 'text'
      };
    }

    // Enhanced return policy
    if (message.includes('return') || message.includes('exchange') || message.includes('refund')) {
      return {
        text: `🔄 **Return & Exchange Policy:**\n\n✅ 7-day return policy\n🔄 Easy exchanges available\n💯 Hassle-free process\n📋 Original condition required\n🏷️ Tags must be attached\n💰 Full refund guaranteed\n📞 Contact us for assistance\n\nNeed to return something? I can guide you through the process! 😊`,
        messageType: 'text'
      };
    }

    // Store information and contact
    if (message.includes('contact') || message.includes('phone') || message.includes('email') || message.includes('store info')) {
      return {
        text: `📞 **Contact Information:**\n\n📱 Phone: +84967383946\n📧 Email: nghiemxuanquan2003@gmail.com\n💬 Live Chat: Right here with me!\n🕐 Support Hours: 24/7\n\n🏪 **Store Features:**\n• ${products.length} products available\n• Secure online shopping\n• Multiple payment options\n• Fast delivery service\n\nI'm always here to help! 😊`,
        messageType: 'text'
      };
    }

    // What products do you have
    if (message.includes('what do you have') || message.includes('what products') || message.includes('categories') || message.includes('what do you sell')) {
      const categories = [...new Set(products.map(p => p.category))];
      const subCategories = [...new Set(products.map(p => p.subCategory))];
      const categoryCount = categories.map(cat => `${cat}: ${products.filter(p => p.category === cat).length} items`);
      
      return {
        text: `🛍️ **Our Complete Collection:**\n\n👥 **Categories (${products.length} total products):**\n${categoryCount.map(item => `• ${item}`).join('\n')}\n\n👕 **Product Types:**\n${subCategories.map(sub => `• ${sub}`).join('\n')}\n\n🌟 **Special Collections:**\n• ${products.filter(p => p.bestseller).length} Best Sellers\n• Latest Arrivals\n• Seasonal Collections\n\nWhat catches your interest? 🤔`,
        messageType: 'text'
      };
    }

    // Default enhanced response with context
    const defaultResponses = [
      `I'm not quite sure what you're looking for, but I'm here to help! 🤔`,
      `Hmm, let me think about that. Could you be more specific? 🧐`,
      `I want to help you find exactly what you need! Can you tell me more? 💭`
    ];

    const contextHelp = userContext.searchHistory.length > 0 ? 
      `\n\nI noticed you were looking at ${userContext.searchHistory[0]} earlier. Want to explore similar items?` : 
      '\n\nTry asking me about:\n• Specific products ("red shirts")\n• Categories ("men\'s clothing")\n• Price ranges ("under $50")\n• Store info ("shipping details")';

    return {
      text: `${defaultResponses[Math.floor(Math.random() * defaultResponses.length)]}${contextHelp}`,
      messageType: 'text'
    };
  }, [products, currency, user, isAuthenticated, userContext, session]);

  const sendMessage = useCallback((userMessage: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isBot: false,
      timestamp: new Date(),
      messageType: 'text',
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate realistic bot typing delay
    const typingDelay = Math.min(Math.max(userMessage.length * 50, 800), 2500);
    
    setTimeout(() => {
      const response = generateResponse(userMessage);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isBot: true,
        timestamp: new Date(),
        products: response.products,
        messageType: response.messageType || 'text',
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, typingDelay);
  }, [generateResponse]);

  const clearMessages = useCallback(() => {
    const greeting = getPersonalizedGreeting();
    setMessages([greeting]);
    setUserContext({ searchHistory: [] });
    localStorage.removeItem('chatbot_history');
  }, [user]);

  const getQuickSuggestions = useCallback(() => {
    const baseSuggestions = [
      { text: '🔥 Best sellers', message: 'Show me best sellers' },
      { text: '✨ Latest arrivals', message: 'Latest arrivals' },
      { text: '💰 Budget friendly', message: 'Show me cheap products' },
      { text: '❓ Help', message: 'What can you help me with?' },
    ];

    if (userContext.lastCategory) {
      baseSuggestions.unshift({
        text: `👕 More ${userContext.lastCategory}`,
        message: `Show me more ${userContext.lastCategory} clothing`
      });
    } else {
      baseSuggestions.unshift(
        { text: '👕 Men\'s clothing', message: 'Men\'s clothing' },
        { text: '👗 Women\'s clothing', message: 'Women\'s clothing' }
      );
    }

    return baseSuggestions.slice(0, 6);
  }, [userContext]);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    userContext,
    session,
    quickSuggestions: getQuickSuggestions(),
  };
};
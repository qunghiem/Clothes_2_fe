import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectProducts, selectCurrency } from '../store/slices/shopSlice';
import { Product } from '../types';

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  products?: Product[];
}

interface ChatbotResponse {
  text: string;
  products?: Product[];
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! 👋 I\'m your shopping assistant. I can help you find products, check prices, and answer questions about our store. What can I help you with today?',
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const products = useSelector(selectProducts);
  const currency = useSelector(selectCurrency);

  const generateResponse = useCallback((userMessage: string): ChatbotResponse => {
    const message = userMessage.toLowerCase().trim();

    // Greeting responses
    if (message.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
      return {
        text: "Hello! 😊 How can I help you today? You can ask me about products, prices, categories, or anything about our store!"
      };
    }

    // Goodbye responses
    if (message.match(/(bye|goodbye|see you|thanks|thank you|thats all)/)) {
      return {
        text: "Thank you for visiting! 😊 Feel free to ask me anything anytime. Have a great day!"
      };
    }

    // Product search by name
    if (message.includes('find') || message.includes('search') || message.includes('looking for')) {
      const searchTerms = message.replace(/(find|search|looking for|show me|i want|i need)/g, '').trim();
      
      if (searchTerms) {
        const foundProducts = products.filter(product => 
          product.name.toLowerCase().includes(searchTerms) ||
          product.description.toLowerCase().includes(searchTerms) ||
          product.category.toLowerCase().includes(searchTerms) ||
          product.subCategory.toLowerCase().includes(searchTerms)
        );

        if (foundProducts.length > 0) {
          return {
            text: `I found ${foundProducts.length} product(s) matching "${searchTerms}". Here they are:`,
            products: foundProducts.slice(0, 6) // Limit to 6 products
          };
        } else {
          return {
            text: `Sorry, I couldn't find any products matching "${searchTerms}". Try searching for categories like "men", "women", "kids", "topwear", "bottomwear", or "winterwear".`
          };
        }
      }
    }

    // Category queries
    if (message.includes('men') || message.includes('male')) {
      const menProducts = products.filter(p => p.category.toLowerCase() === 'men');
      return {
        text: `We have ${menProducts.length} products for men. Here are some popular items:`,
        products: menProducts.slice(0, 6)
      };
    }

    if (message.includes('women') || message.includes('female') || message.includes('ladies')) {
      const womenProducts = products.filter(p => p.category.toLowerCase() === 'women');
      return {
        text: `We have ${womenProducts.length} products for women. Here are some popular items:`,
        products: womenProducts.slice(0, 6)
      };
    }

    if (message.includes('kids') || message.includes('children') || message.includes('child')) {
      const kidsProducts = products.filter(p => p.category.toLowerCase() === 'kids');
      return {
        text: `We have ${kidsProducts.length} products for kids. Here are some popular items:`,
        products: kidsProducts.slice(0, 6)
      };
    }

    // Product type queries
    if (message.includes('shirt') || message.includes('top') || message.includes('topwear')) {
      const topProducts = products.filter(p => 
        p.subCategory.toLowerCase() === 'topwear' || 
        p.name.toLowerCase().includes('shirt') ||
        p.name.toLowerCase().includes('top')
      );
      return {
        text: `Here are our top wear products:`,
        products: topProducts.slice(0, 6)
      };
    }

    if (message.includes('pant') || message.includes('bottom') || message.includes('bottomwear') || message.includes('trouser')) {
      const bottomProducts = products.filter(p => 
        p.subCategory.toLowerCase() === 'bottomwear' ||
        p.name.toLowerCase().includes('pant') ||
        p.name.toLowerCase().includes('trouser')
      );
      return {
        text: `Here are our bottom wear products:`,
        products: bottomProducts.slice(0, 6)
      };
    }

    if (message.includes('winter') || message.includes('jacket') || message.includes('coat') || message.includes('winterwear')) {
      const winterProducts = products.filter(p => 
        p.subCategory.toLowerCase() === 'winterwear' ||
        p.name.toLowerCase().includes('jacket') ||
        p.name.toLowerCase().includes('coat')
      );
      return {
        text: `Here are our winter wear products:`,
        products: winterProducts.slice(0, 6)
      };
    }

    // Best sellers
    if (message.includes('best') || message.includes('popular') || message.includes('trending') || message.includes('bestseller')) {
      const bestSellers = products.filter(p => p.bestseller);
      return {
        text: `Here are our best-selling products:`,
        products: bestSellers.slice(0, 6)
      };
    }

    // Latest products
    if (message.includes('latest') || message.includes('new') || message.includes('recent')) {
      const latestProducts = products.sort((a, b) => b.date - a.date);
      return {
        text: `Here are our latest arrivals:`,
        products: latestProducts.slice(0, 6)
      };
    }

    // Price queries
    if (message.includes('price') || message.includes('cost') || message.includes('cheap') || message.includes('expensive')) {
      if (message.includes('cheap') || message.includes('affordable') || message.includes('budget')) {
        const cheapProducts = products.sort((a, b) => a.price - b.price);
        return {
          text: `Here are our most affordable products:`,
          products: cheapProducts.slice(0, 6)
        };
      }
      
      if (message.includes('expensive') || message.includes('premium') || message.includes('luxury')) {
        const expensiveProducts = products.sort((a, b) => b.price - a.price);
        return {
          text: `Here are our premium products:`,
          products: expensiveProducts.slice(0, 6)
        };
      }

      return {
        text: `Our products range from ${currency}${Math.min(...products.map(p => p.price))} to ${currency}${Math.max(...products.map(p => p.price))}. You can filter by price on our collection page!`
      };
    }

    // Size queries
    if (message.includes('size') || message.includes('sizes')) {
      const allSizes = [...new Set(products.flatMap(p => p.sizes))];
      return {
        text: `We offer these sizes: ${allSizes.join(', ')}. You can check available sizes for each product on the product page!`
      };
    }

    // Shipping and delivery
    if (message.includes('shipping') || message.includes('delivery') || message.includes('ship')) {
      return {
        text: `We offer fast shipping with a delivery fee of ${currency}10. Orders are usually delivered within 7 days. We also offer cash on delivery option! 📦`
      };
    }

    // Return policy
    if (message.includes('return') || message.includes('exchange') || message.includes('refund')) {
      return {
        text: `We have a 7-day return and exchange policy! You can return any item within 7 days of delivery. We also offer hassle-free exchanges. 🔄`
      };
    }

    // Help queries
    if (message.includes('help') || message.includes('support') || message.includes('assist')) {
      return {
        text: `I'm here to help! You can ask me about:
        • Finding specific products
        • Product categories (men, women, kids)
        • Product types (shirts, pants, jackets)
        • Prices and sizes
        • Shipping and delivery
        • Return policy
        • Best sellers and new arrivals
        
        Just type what you're looking for! 😊`
      };
    }

    // Category list
    if (message.includes('categories') || message.includes('what do you sell') || message.includes('what products')) {
      const categories = [...new Set(products.map(p => p.category))];
      const subCategories = [...new Set(products.map(p => p.subCategory))];
      
      return {
        text: `We sell clothing in these categories:
        
        👥 **Categories:** ${categories.join(', ')}
        👕 **Types:** ${subCategories.join(', ')}
        
        We have ${products.length} products in total! What would you like to explore?`
      };
    }

    // Contact info
    if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
      return {
        text: `You can reach us at:
        📞 Phone: +84967383946
        📧 Email: nghiemxuanquan2003@gmail.com
        
        Or continue chatting with me for quick help! 😊`
      };
    }

    // Default response for unrecognized queries
    return {
      text: `I'm not sure I understand that. I can help you with:
      • Finding products ("show me shirts", "men's clothing")
      • Product information (prices, sizes, categories)
      • Store policies (shipping, returns)
      • Best sellers and new arrivals
      
      What would you like to know? 🤔`
    };
  }, [products, currency]);

  const sendMessage = useCallback((userMessage: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const response = generateResponse(userMessage);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isBot: true,
        timestamp: new Date(),
        products: response.products,
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200); // Random delay between 800-2000ms
  }, [generateResponse]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        text: 'Hello! 👋 I\'m your shopping assistant. I can help you find products, check prices, and answer questions about our store. What can I help you with today?',
        isBot: true,
        timestamp: new Date(),
      }
    ]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
  };
};
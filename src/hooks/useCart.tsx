
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  images: string[];
  category: string;
  brand: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartTotal: number;
  totalItems: number;
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('groceryHub_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Loading cart from localStorage:', parsedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear corrupted cart data
        localStorage.removeItem('groceryHub_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('Saving cart to localStorage:', cartItems);
    localStorage.setItem('groceryHub_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: any, quantity = 1) => {
    console.log('Adding to cart:', product, 'quantity:', quantity);
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        const updatedItems = prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        console.log('Updated existing item in cart:', updatedItems);
        return updatedItems;
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          salePrice: product.sale_price,
          quantity,
          images: product.images || [],
          category: product.category,
          brand: product.brand,
        };
        const updatedItems = [...prevItems, newItem];
        console.log('Added new item to cart:', updatedItems);
        return updatedItems;
      }
    });
  };

  const removeFromCart = (productId: string) => {
    console.log('Removing from cart:', productId);
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== productId);
      console.log('Cart after removal:', updatedItems);
      return updatedItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    console.log('Updating quantity for:', productId, 'to:', quantity);
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      console.log('Cart after quantity update:', updatedItems);
      return updatedItems;
    });
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCartItems([]);
    localStorage.removeItem('groceryHub_cart');
    // Also clear applied coupons when cart is cleared
    localStorage.removeItem('appliedCoupon');
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const itemPrice = item.salePrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const value = {
    cartItems,
    cartTotal,
    totalItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCartItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

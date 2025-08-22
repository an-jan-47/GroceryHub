
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useCouponState } from '@/components/CouponStateManager';

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
  deliveryFee: number;
  finalTotal: number;
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
        // Force refresh of cart items with current prices
        const refreshedCart = parsedCart.map(item => ({
          ...item,
          price: Number(item.price),
          salePrice: item.salePrice ? Number(item.salePrice) : undefined,
          quantity: Number(item.quantity)
        }));
        setCartItems(refreshedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('groceryHub_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  // Update the useEffect that saves to localStorage
  useEffect(() => {
    try {
      console.log('Saving cart to localStorage:', cartItems);
      localStorage.setItem('groceryHub_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (product: any, quantity = 1) => {
    console.log('Adding to cart:', product, 'quantity:', quantity);
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // If item already exists, add the new quantity to existing quantity
        const updatedItems = prevItems.map(item =>
          item.id === product.id
            ? { 
                ...item,
                salePrice: product.salePrice || product.sale_price,
                quantity: existingItem.quantity + Number(quantity) // Add to existing quantity
              }
            : item
        );
        console.log('Updated existing item in cart:', updatedItems);
        return updatedItems;
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice || product.sale_price,
          quantity: Number(quantity), 
          images: product.images || [],
          category: product.category || '',
          brand: product.brand || '',
          stock: product.stock || 999
        };
        console.log('Added new item to cart:', newItem);
        return [...prevItems, newItem];
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
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Optimistic update
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      // Update localStorage immediately
      localStorage.setItem('groceryHub_cart', JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('groceryHub_cart');
    // Clear coupons when cart is cleared
    if (typeof window !== 'undefined') {
      localStorage.removeItem('appliedCoupon');
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const itemPrice = item.salePrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calculate delivery fee: ₹50 if cart total is less than ₹2000
  const deliveryFee = cartTotal < 2000 && cartTotal > 0 ? 50 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const value = {
    cartItems,
    cartTotal,
    totalItems,
    deliveryFee,
    finalTotal,
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

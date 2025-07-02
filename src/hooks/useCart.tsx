
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  image?: string;
  images?: string[];
  stock?: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  items: CartItem[];
  total: number;
  cartTotal: number;
  addToCart: (product: any, quantity?: number) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const total = cartItems.reduce((sum, item) => {
    const itemPrice = item.salePrice || item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  const addToCart = (product: any, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: quantity }
            : item
        );
      }
      
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.sale_price,
        quantity,
        image: product.images?.[0] || product.image,
        images: product.images,
        stock: product.stock
      }];
    });
  };

  const addItem = (item: CartItem) => {
    addToCart(item, item.quantity);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      items: cartItems,
      total,
      cartTotal: total,
      addToCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

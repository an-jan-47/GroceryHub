
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image?: string;
  images?: string[];
  quantity: number;
  stock?: number;
  [key: string]: any;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  totalItems: number;
  subtotal: number;
  cartTotal: number; // Added cartTotal property
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const addToCart = (product: CartItem) => {
    if (!product.quantity) {
      product.quantity = 1;
    }
    
    // Check if we have stock information and validate
    if (product.stock !== undefined && product.stock <= 0) {
      toast("Product out of stock", {
        description: `Sorry, ${product.name} is currently out of stock.`
      });
      return;
    }
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // If the item already exists in cart, add to the quantity
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + product.quantity;
        
        // Stock check
        if (product.stock !== undefined && newQuantity > product.stock) {
          toast("Maximum stock reached", {
            description: `Sorry, only ${product.stock} units of this product are available.`
          });
          updatedItems[existingItemIndex].quantity = product.stock;
        } else {
          updatedItems[existingItemIndex].quantity = newQuantity;
        }
        
        return updatedItems;
      } else {
        // If it's a new item, add it to cart
        return [...prevItems, { ...product }];
      }
    });
    
    toast("Added to cart", {
      description: `${product.name} has been added to your cart.`
    });
  };
  
  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast("Removed from cart", {
      description: "Item has been removed from your cart."
    });
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prevItems => {
      const itemIndex = prevItems.findIndex(item => item.id === productId);
      
      if (itemIndex >= 0) {
        const item = prevItems[itemIndex];
        
        // If quantity is zero or less, remove the item
        if (quantity <= 0) {
          const newItems = [...prevItems];
          newItems.splice(itemIndex, 1);
          
          toast("Removed from cart", {
            description: `${item.name} has been removed from your cart.`
          });
          
          return newItems;
        }
        
        // Check against stock if available
        if (item.stock !== undefined && quantity > item.stock) {
          toast("Maximum stock reached", {
            description: `Sorry, only ${item.stock} units of this product are available.`
          });
          
          const newItems = [...prevItems];
          newItems[itemIndex] = { ...item, quantity: item.stock };
          return newItems;
        }
        
        // Update quantity
        const newItems = [...prevItems];
        newItems[itemIndex] = { ...item, quantity };
        return newItems;
      }
      
      return prevItems;
    });
  };
  
  const clearCart = () => {
    setCartItems([]);
    toast("Cart cleared", {
      description: "All items have been removed from your cart."
    });
  };
  
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.salePrice ?? item.price;
    return total + itemPrice * item.quantity;
  }, 0);
  
  // Set cartTotal to be equal to subtotal for now
  const cartTotal = subtotal;
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        totalItems,
        subtotal,
        cartTotal // Added cartTotal to the provider
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

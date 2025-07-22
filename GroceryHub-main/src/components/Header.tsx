import React from "react";

import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { cartItems, totalItems } = useCart();
  const { user } = useAuth();
  // Use totalItems instead of cartItems.length
  const cartItemsCount = totalItems;
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm pt-safe">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6 mt-2">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-blue-500">GroceryHub</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cartItemsCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                {cartItemsCount}
              </Badge>
            )}
          </Link>
          <Link to={user ? "/profile" : "/login"} className="block">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

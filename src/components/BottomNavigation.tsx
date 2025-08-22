
import React from "react";
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';

const BottomNavigation = () => {
  const location = useLocation();
  const { cartItems, totalItems } = useCart();
  const { user } = useAuth();
  const cartItemsCount = totalItems;
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-md pb-2">
      <div className="grid grid-cols-4 h-12">
        <Link to="/" className={`bottom-nav-item ${location.pathname === '/' ? 'bottom-nav-active' : 'text-gray-500'}`}>
          <Home className="w-4 h-4 mb-1" />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/explore" className={`bottom-nav-item ${location.pathname.includes('/explore') ? 'bottom-nav-active' : 'text-gray-500'}`}>
          <Search className="w-4 h-4 mb-1" />
          <span className="text-xs">Explore</span>
        </Link>
        <Link to="/cart" className={`bottom-nav-item ${isActive('/cart') ? 'bottom-nav-active' : 'text-gray-500'}`}>
          <div className="relative">
            <ShoppingCart className="w-4 h-4 mb-1" />
            {cartItemsCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500/90 text-white text-xs font-medium rounded-full h-4 w-4 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </div>
            )}
          </div>
          <span className="text-xs">Cart</span>
        </Link>
        <Link 
          to={user ? "/profile" : "/login"} 
          className={`bottom-nav-item ${isActive('/profile') || isActive('/login') ? 'bottom-nav-active' : 'text-gray-500'}`}
        >
          <User className="w-4 h-4 mb-1" />
          <span className="text-xs">{user ? "Profile" : "Login"}</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;

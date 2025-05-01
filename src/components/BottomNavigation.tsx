
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';

const BottomNavigation = () => {
  const location = useLocation();
  const { cartItems } = useCart();
  const { user } = useAuth();
  const cartItemsCount = cartItems.length;
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-md">
      <div className="grid grid-cols-4 h-16">
        <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'bottom-nav-active' : 'text-gray-500'}`}>
          <Home className="w-6 h-6 mb-1" />
          <span>Home</span>
        </Link>
        <Link to="/explore" className={`bottom-nav-item ${isActive('/explore') ? 'bottom-nav-active' : 'text-gray-500'}`}>
          <Search className="w-6 h-6 mb-1" />
          <span>Explore</span>
        </Link>
        <Link to="/cart" className={`bottom-nav-item ${isActive('/cart') ? 'bottom-nav-active' : 'text-gray-500'}`}>
          <div className="relative">
            <ShoppingCart className="w-6 h-6 mb-1" />
            {cartItemsCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                {cartItemsCount}
              </Badge>
            )}
          </div>
          <span>Cart</span>
        </Link>
        <Link 
          to={user ? "/profile" : "/login"} 
          className={`bottom-nav-item ${isActive('/profile') || isActive('/login') ? 'bottom-nav-active' : 'text-gray-500'}`}
        >
          <User className="w-6 h-6 mb-1" />
          <span>{user ? "Profile" : "Login"}</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;

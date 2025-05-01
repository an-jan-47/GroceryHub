
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { cartItems } = useCart();
  const { user } = useAuth();
  const cartItemsCount = cartItems.length;
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hide search on these pages
  const hideSearchOnPaths = ['/cart', '/profile', '/login', '/signup'];
  const shouldShowSearch = !hideSearchOnPaths.includes(location.pathname);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">ShopNexus</span>
        </Link>
        
        {shouldShowSearch && (
          <form onSubmit={handleSearch} className="hidden md:flex relative w-full max-w-sm mx-4">
            <input
              type="search"
              placeholder="Search products..."
              className="w-full py-2 pl-4 pr-10 border rounded-full bg-gray-50 focus:outline-none focus:ring-1 focus:ring-brand-blue"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
          </form>
        )}
        
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cartItemsCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                {cartItemsCount}
              </Badge>
            )}
          </Link>
          <Link to={user ? "/profile" : "/login"} className="hidden md:block">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>
      
      {/* Mobile search bar - only show on relevant pages */}
      {shouldShowSearch && (
        <div className="md:hidden px-4 pb-2">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="search"
              placeholder="Search products..."
              className="w-full py-2 pl-4 pr-10 border rounded-full bg-gray-50 focus:outline-none focus:ring-1 focus:ring-brand-blue"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;

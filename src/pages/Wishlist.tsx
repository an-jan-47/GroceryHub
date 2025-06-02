import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { Separator } from '@/components/ui/separator';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          {wishlistItems.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => clearWishlist()}
              className="text-red-500 border-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
        
        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map(item => (
              <div key={item.id} className="relative">
                <ProductCard 
                  product={{
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    sale_price: item.sale_price,
                    images: item.images,
                    rating: 0,
                    review_count: 0,
                    stock: 999, // Assuming in stock since we don't have this info
                    category: '',
                    brand: '',
                    description: ''
                  }} 
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white rounded-full text-red-500 shadow-sm hover:bg-red-50"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <Heart className="h-5 w-5 fill-current" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you like by clicking the heart icon on product pages</p>
            <Button onClick={() => navigate('/explore')} className="bg-blue-600 hover:bg-blue-700">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Explore Products
            </Button>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default WishlistPage;
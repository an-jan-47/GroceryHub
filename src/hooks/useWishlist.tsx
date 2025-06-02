import { useLocalStorage } from './useLocalStorage';
import { toast } from '@/components/ui/sonner';

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  sale_price?: number;
  images: string[];
};

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useLocalStorage<WishlistItem[]>('wishlist', []);

  const addToWishlist = (product: WishlistItem) => {
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    
    if (isInWishlist) {
      toast('Already in wishlist', {
        description: `${product.name} is already in your wishlist`,
      });
      return;
    }
    
    setWishlistItems(prev => [...prev, product]);
    toast('Added to wishlist', {
      description: `${product.name} has been added to your wishlist`,
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
    toast('Removed from wishlist', {
      description: 'Item has been removed from your wishlist',
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    toast('Wishlist cleared', {
      description: 'All items have been removed from your wishlist',
    });
  };

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };
}
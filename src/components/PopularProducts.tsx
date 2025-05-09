
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPopularProducts, PopularProduct } from '@/services/productService';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

const PopularProducts = () => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { data: popularProducts, isLoading } = useQuery({
    queryKey: ['popularProducts'],
    queryFn: () => getPopularProducts(4),  // Get top 4 popular products
  });

  const handleAddToCart = (product: any) => {
    // Don't allow adding if out of stock
    if (product.stock <= 0) {
      toast("Out of stock", {
        description: `${product.name} is currently unavailable`,
        position: "bottom-center"
      });
      return;
    }
    
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
      toast("Updated cart quantity", {
        description: `${product.name} quantity updated to ${existingItem.quantity + 1}`,
        position: "bottom-center"
      });
    } else {
      addToCart({
        ...product,
        quantity: 1,
      });
      toast("Added to cart", {
        description: `${product.name} has been added to your cart`,
        position: "bottom-center"
      });
    }
  };

  const getProductQuantityInCart = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-brand-blue" />
          <h2 className="text-xl font-bold">Popular Right Now</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!popularProducts || popularProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h2 className="text-xl font-bold">Popular Right Now</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {popularProducts.map((item) => {
          const product = item.product;
          if (!product) return null;
          
          const isTopSeller = item === popularProducts[0];
          const isOnSale = product.sale_price !== null;
          const inCart = getProductQuantityInCart(product.id);
          
          return (
            <div
              key={product.id} 
              className={`block rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${isTopSeller ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}
            >
              <Link to={`/product/${product.id}`} className="relative h-40 block">
                <img 
                  src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                  {isTopSeller && (
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      <Flame className="w-3 h-3 mr-1" />
                      Top Seller
                    </Badge>
                  )}
                  {isOnSale && (
                    <Badge variant="destructive">
                      Sale
                    </Badge>
                  )}
                  {product.stock <= 0 && (
                    <Badge variant="outline" className="bg-gray-800 text-white border-0">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                    {item.total_orders} sold
                  </Badge>
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                  <div className="flex items-center gap-1">
                    {product.sale_price ? (
                      <>
                        <span className="font-bold text-brand-blue">${product.sale_price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 line-through">${product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-bold">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                </Link>
                
                <div className="mt-2">
                  {inCart > 0 ? (
                    <div className="w-full flex items-center border rounded-md">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(product.id, inCart - 1);
                        }}
                        className="p-2 text-gray-600 hover:text-brand-blue"
                        disabled={product.stock <= 0}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="flex-1 text-center text-sm">{inCart}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(product.id, inCart + 1);
                        }}
                        className="p-2 text-gray-600 hover:text-brand-blue"
                        disabled={product.stock <= 0 || inCart >= product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-xs"
                      disabled={product.stock <= 0}
                    >
                      {product.stock <= 0 ? (
                        "Out of Stock"
                      ) : (
                        <>
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularProducts;

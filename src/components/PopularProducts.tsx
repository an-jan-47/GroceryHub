
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPopularProducts, PopularProduct } from '@/services/productService';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp } from 'lucide-react';

const PopularProducts = () => {
  const { data: popularProducts, isLoading } = useQuery({
    queryKey: ['popularProducts'],
    queryFn: () => getPopularProducts(4),  // Get top 4 popular products
  });

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
          
          return (
            <Link 
              to={`/product/${product.id}`} 
              key={product.id} 
              className={`block rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${isTopSeller ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}
            >
              <div className="relative h-40">
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
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                    {item.total_orders} sold
                  </Badge>
                </div>
              </div>
              <div className="p-3">
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
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PopularProducts;

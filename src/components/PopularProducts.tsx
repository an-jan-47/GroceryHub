
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPopularProducts } from '@/services/productService';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import ProductCard from '@/components/ProductCard';

const PopularProducts = () => {
  const { addToCart, cartItems, updateQuantity } = useCart();
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
            <div key={i} className="bg-gray-100 rounded-lg h-64"></div>
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
        <TrendingUp className="w-5 h-5 text-brand-blue" />
        <h2 className="text-xl font-bold">Popular Right Now</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {popularProducts.map((item) => {
          const product = item.product;
          if (!product) return null;
          
          return (
            <ProductCard 
              key={product.id}
              product={product}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PopularProducts;

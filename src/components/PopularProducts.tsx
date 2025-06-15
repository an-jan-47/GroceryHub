
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFeaturedProducts } from '@/services/productService';
import ProductCard from './ProductCard';
import { Skeleton } from './ui/skeleton';

const PopularProducts = () => {
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: getFeaturedProducts,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Most Popular</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={`popular-loading-${i}`} className="space-y-2">
              <Skeleton className="h-40 w-full rounded-md" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Most Popular</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {featuredProducts.map((product) => (
          <div key={product.id}>
            <ProductCard
              product={product}
              showBuyNow={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularProducts;

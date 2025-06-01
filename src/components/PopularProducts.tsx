
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPopularProducts } from '@/services/productService';
import ProductCard from '@/components/ProductCard';

const PopularProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['popularProducts'],
    queryFn: getPopularProducts
  });

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Most Popular</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Most Popular</h2>
        <Link to="/explore" className="text-brand-blue text-sm">View All</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            showBuyNow={false}
          />
        ))}
      </div>
    </section>
  );
};

export default PopularProducts;

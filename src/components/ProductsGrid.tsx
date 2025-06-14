
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types/product';

interface ProductsGridProps {
  products?: Product[];
  customProducts?: Product[];
  isLoading?: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ 
  products = [], 
  customProducts, 
  isLoading 
}) => {
  // Use customProducts if provided, otherwise use products, with fallback to empty array
  const displayProducts = customProducts || products || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={`loading-${i}`} className="space-y-2">
            <div className="h-40 w-full bg-gray-200 animate-pulse rounded-md" />
            <div className="space-y-1.5">
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {displayProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
};

export default ProductsGrid;

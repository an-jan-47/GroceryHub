
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/services/productService';

interface ProductsGridProps {
  customProducts?: Product[];
}

export default function ProductsGrid({ customProducts = [] }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {customProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showBuyNow={false}
        />
      ))}
    </div>
  );
}

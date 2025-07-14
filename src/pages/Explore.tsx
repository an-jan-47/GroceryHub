
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import SearchFilters from '@/components/SearchFilters';
import ProductCard from '@/components/ProductCard';
import { useSearchProducts } from '@/hooks/useSearchProducts';
import { SearchFiltersType } from '@/services/searchService';
import { Product } from '@/types';

const Explore = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    category: category,
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'name',
    sortOrder: 'asc',
    brands: [],
    inStock: false
  });

  const { data: products = [], isLoading } = useSearchProducts(filters);

  const handleFilterChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    if (category) {
      setFilters(prev => ({
        ...prev,
        category: category
      }));
    }
  }, [category]);

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Explore Products</h1>
        
        <SearchFilters 
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        {!isLoading && products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Explore;

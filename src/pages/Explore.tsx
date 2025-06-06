
import { useState } from 'react';
import { useSearchParams as useSearchParamsPolyfill } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ProductsGrid from '@/components/ProductsGrid';
import SearchFiltersComponent from '@/components/SearchFilters';
import { useQuery } from '@tanstack/react-query';
import { searchProducts, type SearchFilters as SearchFiltersType } from '@/services/searchService';

const useSearchParams = () => {
  try {
    return useSearchParamsPolyfill();
  } catch (error) {
    // Return a mock implementation if outside Router context
    console.warn('useSearchParams used outside Router context');
    return [new URLSearchParams(), () => {}];
  }
};

const Explore = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [filters, setFilters] = useState<SearchFiltersType>({ query: initialQuery });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['searchProducts', filters],
    queryFn: () => searchProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-6 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Explore Products</h1>
        
        <SearchFiltersComponent 
          onFilterChange={setFilters}
          initialQuery={initialQuery}
        />
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            {products.length > 0 ? (
              <>
                <p className="text-gray-600 mb-4">{products.length} products found</p>
                <ProductsGrid customProducts={products} />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Explore;

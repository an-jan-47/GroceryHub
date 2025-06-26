
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ProductsGrid from '@/components/ProductsGrid';
import SearchFiltersComponent from '@/components/SearchFilters';
import { useQuery } from '@tanstack/react-query';
import { searchProducts, type SearchFilters as SearchFiltersType } from '@/services/searchService';
import PullToRefreshWrapper from '@/components/PullToRefresh';

const Explore = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  
  // Add pageTitle based on search parameters
  const pageTitle = initialCategory 
    ? `Explore ${initialCategory}`
    : initialQuery 
    ? `Search: ${initialQuery}` 
    : 'Explore Products';

  const [filters, setFilters] = useState<SearchFiltersType>({ 
    query: initialQuery,
    category: initialCategory 
  });

  // Update filters when URL params change
  useEffect(() => {
    const newQuery = searchParams.get('q') || '';
    const newCategory = searchParams.get('category') || '';
    
    setFilters(prev => ({
      ...prev,
      query: newQuery,
      category: newCategory
    }));
  }, [searchParams]);

  const { data: products = [], isLoading, refetch } = useQuery({  // Add refetch here
    queryKey: ['searchProducts', filters],
    queryFn: () => searchProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header />
      <PullToRefreshWrapper onRefresh={refetch}>
        <main className="container px-4 py-6 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
            {initialCategory && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Category: {initialCategory}
              </span>
            )}
          </div>
          
          <SearchFiltersComponent 
            onFilterChange={setFilters}
            initialQuery={initialQuery}
            initialCategory={initialCategory}
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
                  <p className="text-gray-600 mb-4">
                    {products.length} product{products.length !== 1 ? 's' : ''} found
                    {initialCategory && ` in ${initialCategory}`}
                  </p>
                  <ProductsGrid customProducts={products} />
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found</p>
                  <p className="text-gray-400">
                    {initialCategory 
                      ? `No products available in ${initialCategory} category`
                      : 'Try adjusting your search or filters'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </PullToRefreshWrapper>
      <BottomNavigation />
    </div>
  );
};

export default Explore;

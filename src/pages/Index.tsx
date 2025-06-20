
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import ProductsGrid from "@/components/ProductsGrid";
import PopularProducts from "@/components/PopularProducts";
import SearchFilters from "@/components/SearchFilters";
import { useNavigationGestures } from "@/hooks/useNavigationGestures";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/categoryService";
import { getProducts } from "@/services/productService";
import { searchProducts, type SearchFilters as SearchFiltersType } from "@/services/searchService";
import BannerCarousel from "@/components/BannerCarousel";

const Index = () => {
  console.log('Index page rendering');
  
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [isSearchActive, setIsSearchActive] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => getProducts()
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['searchProducts', filters],
    queryFn: () => searchProducts(filters),
    enabled: isSearchActive && (!!filters.query || !!filters.category || filters.minPrice !== undefined || filters.maxPrice !== undefined),
    staleTime: 1000 * 60 * 5,
  });

  // Memoized filter change handler to prevent infinite loops
  const handleFilterChange = useCallback((newFilters: SearchFiltersType) => {
    console.log('Index: Filter change received:', newFilters);
    // Only set filters and activate search if there are actual filter values
    if (newFilters.query || newFilters.category || newFilters.minPrice !== undefined || newFilters.maxPrice !== undefined) {
      setFilters(newFilters);
      setIsSearchActive(true);
    }
  }, []);

  const clearSearch = () => {
    console.log('Index: Clearing search');
    setFilters({});
    setIsSearchActive(false);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header />

      <main className="container px-4 py-4 mx-auto">
        <div className="mb-6">
          <SearchFilters 
            onFilterChange={handleFilterChange}
            initialQuery=""
          />
        </div>

        {isSearchActive ? (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Search Results</h2>
              <Button 
                onClick={clearSearch} 
                variant="outline"
                className="text-sm"
              >
                Clear Search
              </Button>
            </div>

            {isSearching ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={`search-loading-${i}`} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <ProductsGrid customProducts={searchResults} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Static Banner */}
            <BannerCarousel />

            {/* Shop by Category Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Shop by Category</h2>
                <Link 
                  to="/categories" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.id}
                    to={`/explore?category=${encodeURIComponent(category.name)}`}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-lg bg-gray-100 transition-all duration-300 group-hover:shadow-lg">
                      <div className="aspect-[4/3]">
                        <img
                          src={category.image || '/placeholder.svg'}
                          alt={category.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="absolute bottom-0 p-4 text-white">
                          <h3 className="text-lg font-semibold">{category.name}</h3>
                          <p className="text-sm opacity-90">{category.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <PopularProducts />

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Featured Products</h2>
                <Link 
                  to="/explore" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </Link>
              </div>

              <ProductsGrid customProducts={featuredProducts.slice(0, 8)} />
            </div>
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;

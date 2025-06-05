
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import PopularProducts from '@/components/PopularProducts';
import SearchFiltersComponent from '@/components/SearchFilters';
import { useQuery } from '@tanstack/react-query';
import { searchProducts, getCategories, type SearchFilters as SearchFiltersType } from '@/services/searchService';
import ProductsGrid from '@/components/ProductsGrid';
import { getProducts } from '@/services/productService';
import { getBanners } from '@/services/bannerService';

const Index = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Fetch banners
  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
  });

  // Fetch featured products from explore
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const products = await getProducts();
      return products.slice(0, 8); // Get first 8 products as featured
    },
  });

  const handleAdvancedSearch = async (filters: SearchFiltersType) => {
    setIsSearching(true);
    try {
      const results = await searchProducts(filters);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
    setIsSearching(false);
  };

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-6 mx-auto">
        {/* Banners Section */}
        {banners.length > 0 && (
          <div className="mb-6">
            <div className="grid gap-4">
              {banners.map((banner) => (
                <Link
                  key={banner.id}
                  to={banner.link}
                  className="block w-full"
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-48 md:h-64 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  />
                  {(banner.title || banner.subtitle) && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex flex-col justify-end p-4">
                      {banner.title && (
                        <h2 className="text-white text-xl font-bold mb-1">{banner.title}</h2>
                      )}
                      {banner.subtitle && (
                        <p className="text-white text-sm">{banner.subtitle}</p>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="mb-6">
          <SearchFiltersComponent onFilterChange={handleAdvancedSearch} />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            {isSearching ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
                ))}
              </div>
            ) : (
              <ProductsGrid customProducts={searchResults} />
            )}
          </div>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Shop by Category</h2>
              <Link to="/categories" className="text-brand-blue text-sm flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to={`/explore?category=${encodeURIComponent(category.name)}`}
                  className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-16 h-16 mx-auto mb-2 object-contain"
                  />
                  <h3 className="font-medium text-sm">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Products */}
        <PopularProducts />

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Featured Products</h2>
              <Link to="/explore" className="text-brand-blue text-sm flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <ProductsGrid customProducts={featuredProducts} />
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Index;

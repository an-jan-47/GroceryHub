
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import ProductsGrid from "@/components/ProductsGrid";
import PopularProducts from "@/components/PopularProducts";
import SearchFilters from "@/components/SearchFilters";
import { useNavigationGestures } from "@/hooks/useNavigationGestures";
import { useQuery } from "@tanstack/react-query";
import { getBanners } from "@/services/bannerService";
import { getCategories } from "@/services/categoryService";
import { getProducts } from "@/services/productService";
import { searchProducts, type SearchFilters as SearchFiltersType } from "@/services/searchService";
import BannerCarousel from "@/components/BannerCarousel";

const Index = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners
  });
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });
  
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => getProducts()
  });

  // Add a new query for searched products
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['searchProducts', filters],
    queryFn: () => searchProducts(filters),
    enabled: isSearchActive && (!!filters.query || !!filters.category || filters.minPrice !== undefined || filters.maxPrice !== undefined),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const navigate = useNavigate();

  const handleFilterChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setIsSearchActive(true);
  };

  // Function to clear search and show normal homepage content
  const clearSearch = () => {
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
          // Show search results when search is active
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
                  <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
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
          // Show normal homepage content when search is not active
          <>
            {/* Redesigned Banner Section */}
            {banners && banners.length > 0 && (
              <div className="mb-8">
                <div className="relative overflow-hidden rounded-xl shadow-md">
                  {/* Banner Container */}
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
                  >
                    {banners.map((banner, index) => (
                      <div key={banner.id} className="w-full flex-shrink-0">
                        <Link to={banner.link} className="block">
                          <div className="relative h-56 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
                            <img
                              src={banner.image}
                              alt={banner.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent">
                              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8"> {/* Changed justify-center to justify-end */}
                                <div className="max-w-md text-left"> {/* Added text-left */}
                                  <h2 className="text-white font-bold text-2xl md:text-3xl leading-tight mb-2">
                                    {banner.title}
                                  </h2>
                                  {banner.subtitle && (
                                    <p className="text-white/90 text-sm md:text-base leading-relaxed mb-4">
                                      {banner.subtitle}
                                    </p>
                                  )}
                                  {/* Removed the Shop Now button */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                  
                  {/* Banner Indicators */}
                  {banners.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {banners.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBannerIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Navigation Arrows */}
                  {banners.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

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

            {/* Most Popular Section */}
            <PopularProducts />

            {/* Featured Products Section */}
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

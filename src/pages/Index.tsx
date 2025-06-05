
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Add navigation gestures
  useNavigationGestures();

  // Fetch banners
  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // Fetch featured products from explore page
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => getProducts({ limit: 8 })
  });

  // Auto-change banner every 5 seconds
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const handleSearch = () => {
    // Search functionality would be implemented here
    console.log("Searching for:", searchQuery);
  };

  const handleFilterChange = (filters: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    console.log("Filters changed:", filters);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        {/* Advanced Search Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button onClick={handleSearch} className="shrink-0">
              Search
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 border-t">
              <SearchFilters 
                onFilterChange={handleFilterChange}
                initialQuery={searchQuery}
              />
            </div>
          )}
        </div>

        {/* Banners Section with Scrollable Design */}
        {banners && banners.length > 0 && (
          <div className="mb-6">
            <div className="relative overflow-hidden rounded-lg">
              {/* Banner Container */}
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
              >
                {banners.map((banner, index) => (
                  <div key={banner.id} className="w-full flex-shrink-0">
                    <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center">
                        <div className="text-white p-6">
                          <h2 className="text-2xl font-bold mb-2">{banner.title}</h2>
                          {banner.subtitle && (
                            <p className="text-lg opacity-90 mb-4">{banner.subtitle}</p>
                          )}
                          <Link
                            to={banner.link}
                            className="inline-block bg-white text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                          >
                            Shop Now
                          </Link>
                        </div>
                      </div>
                    </div>
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
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
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
            <h2 className="text-xl font-semibold">Shop by Category</h2>
            <Link 
              to="/categories" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                to={`/explore?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
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
          
          <ProductsGrid customProducts={featuredProducts} />
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Index;

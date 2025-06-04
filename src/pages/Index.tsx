
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import PopularProducts from '@/components/PopularProducts';
import SearchFilters from '@/components/SearchFilters';
import { useQuery } from '@tanstack/react-query';
import { searchProducts, getCategories, type SearchFilters } from '@/services/searchService';
import ProductsGrid from '@/components/ProductsGrid';

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleQuickSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAdvancedSearch = async (filters: SearchFilters) => {
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
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome to GroceryHub</h1>
          <p className="text-gray-600">Fresh groceries delivered to your doorstep</p>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
                placeholder="Search for products..."
                className="pl-10"
              />
            </div>
            <Button onClick={handleQuickSearch}>Search</Button>
          </div>
          
          <Button 
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            variant="outline" 
            size="sm"
          >
            Advanced Search
          </Button>
          
          {showAdvancedSearch && (
            <div className="mt-4">
              <SearchFilters onFilterChange={handleAdvancedSearch} />
            </div>
          )}
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
              <ProductsGrid products={searchResults} />
            )}
          </div>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Shop by Category</h2>
              <Link to="/explore" className="text-brand-blue text-sm flex items-center">
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
      </main>
      
      <BottomNavigation />
    </div>
  );

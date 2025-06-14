
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories } from '@/services/productService';
import { getCategoryNames } from '@/services/categoryService';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ProductsGrid from '@/components/ProductsGrid';

interface SearchFilters {
  category: string[];
  brand: string[];
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState<SearchFilters['sortBy']>('relevance');

  // Fetch products
  const { data: allProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch categories for filter
  const { data: categoryData = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoryNames,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Extract unique brands from products
  useEffect(() => {
    if (allProducts && Array.isArray(allProducts)) {
      const brands = allProducts.map((product: any) => product.brand);
      const uniqueBrands = [...new Set(brands)];
      setSelectedBrands(prev => prev.filter(brand => uniqueBrands.includes(brand)));
    }
  }, [allProducts]);

  // Extract unique categories from products
  useEffect(() => {
    if (allProducts && Array.isArray(allProducts)) {
      const categories = allProducts.map((product: any) => product.category);
      const uniqueCategories = [...new Set(categories)];
      setSelectedCategories(prev => prev.filter(cat => uniqueCategories.includes(cat)));
    }
  }, [allProducts]);

  // Update search query from URL params
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandFilter = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('relevance');
  };

  const applyFilters = (products: any[]) => {
    if (!Array.isArray(products)) return [];
    
    let filtered = [...products];

    // Apply search query filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category)
      );
    }

    // Apply brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => 
        selectedBrands.includes(product.brand)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product => {
      const price = product.sale_price || product.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.sale_price || a.price) - (b.sale_price || b.price);
        case 'price-high':
          return (b.sale_price || b.price) - (a.sale_price || a.price);
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredProducts = applyFilters(allProducts);
  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange.min > 0 || priceRange.max < 10000 || sortBy !== 'relevance';
  const uniqueBrands = Array.isArray(allProducts) ? [...new Set(allProducts.map((p: any) => p.brand))] : [];
  const uniqueCategories = Array.isArray(allProducts) ? [...new Set(allProducts.map((p: any) => p.category))] : [];

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-6 mx-auto">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {hasActiveFilters && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedCategories.map(category => (
              <Badge variant="secondary" className="cursor-pointer">
                {category}
                <X 
                  className="w-3 h-3 ml-1" 
                  onClick={() => handleCategoryFilter(category)}
                />
              </Badge>
            ))}
            {selectedBrands.map(brand => (
              <Badge variant="secondary" className="cursor-pointer">
                {brand}
                <X 
                  className="w-3 h-3 ml-1" 
                  onClick={() => handleBrandFilter(brand)}
                />
              </Badge>
            ))}
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold mb-4">Filters</h3>
            
            {/* Categories */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {uniqueCategories.map((category) => (
                  <Badge
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Brands</h4>
              <div className="flex flex-wrap gap-2">
                {uniqueBrands.map((brand) => (
                  <Badge
                    variant={selectedBrands.includes(brand) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleBrandFilter(brand)}
                  >
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Sort By</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'relevance', label: 'Relevance' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Rating' },
                  { value: 'newest', label: 'Newest' },
                ].map((option) => (
                  <Badge
                    variant={sortBy === option.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSortBy(option.value as SearchFilters['sortBy'])}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
          </h2>
          <p className="text-gray-600">
            {productsLoading ? 'Loading...' : `${filteredProducts.length} products found`}
          </p>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-square"></div>
            ))}
          </div>
        ) : (
          <ProductsGrid 
            customProducts={filteredProducts} 
            title="" 
            showCount={false}
          />
        )}

        {!productsLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <SearchIcon className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Search;

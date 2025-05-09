
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useQuery } from '@tanstack/react-query';
import { getProducts, Product } from '@/services/productService';
import ProductCard from '@/components/ProductCard';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);

  // Fetch all products
  const { data: products, isLoading } = useQuery({
    queryKey: ['searchProducts'],
    queryFn: getProducts
  });
  
  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      setSearchTerm(query);
    }
    
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategories([category]);
    }
    
    const sort = searchParams.get('sort');
    if (sort) {
      setSortBy(sort);
    }
  }, [searchParams]);
  
  // Extract categories and brands
  useEffect(() => {
    if (products) {
      // Get unique categories
      const categories = [...new Set(products.map(p => p.category))];
      setAllCategories(categories);
      
      // Get unique brands
      const brands = [...new Set(products.map(p => p.brand))];
      setAllBrands(brands);
      
      // Find price range
      let min = Number.MAX_SAFE_INTEGER;
      let max = 0;
      
      products.forEach(product => {
        const price = product.sale_price || product.price;
        min = Math.min(min, price);
        max = Math.max(max, price);
      });
      
      // Add some padding to the range
      setMinPrice(Math.floor(min));
      setMaxPrice(Math.ceil(max));
      setPriceRange([Math.floor(min), Math.ceil(max)]);
    }
  }, [products]);

  // Apply filters and search
  useEffect(() => {
    if (!products) return;
    
    let results = [...products];
    
    // Apply search query
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      results = results.filter(product => selectedCategories.includes(product.category));
    }
    
    // Apply brand filter
    if (selectedBrands.length > 0) {
      results = results.filter(product => selectedBrands.includes(product.brand));
    }
    
    // Apply price range
    results = results.filter(product => {
      const price = product.sale_price ?? product.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low-high':
        results.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
        break;
      case 'price-high-low':
        results.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        // Popular is already sorted by the API, but we could potentially enhance this
        break;
      // 'popularity' is default (no sort)
      default:
        break;
    }
    
    setFilteredProducts(results);
  }, [searchTerm, selectedCategories, selectedBrands, priceRange, sortBy, products]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL parameters
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set('query', searchTerm.trim());
    } else {
      params.delete('query');
    }
    setSearchParams(params);
  };
  
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };
  
  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };
  
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([minPrice, maxPrice]);
    setSortBy('popularity');
    
    // Clear URL params except query
    const params = new URLSearchParams();
    const query = searchParams.get('query');
    if (query) {
      params.set('query', query);
    }
    setSearchParams(params);
  };
  
  const getTotalFiltersCount = () => {
    return selectedCategories.length + selectedBrands.length + (priceRange[0] > minPrice || priceRange[1] < maxPrice ? 1 : 0);
  };
  
  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <form onSubmit={handleSearch} className="w-full">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <button 
                    type="button"
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Button type="submit" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  Search
                </Button>
              </form>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Filter className="h-5 w-5" />
                  {getTotalFiltersCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-blue text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {getTotalFiltersCount()}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                
                <div className="py-4 space-y-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium mb-2">Price Range</h3>
                    <Slider 
                      max={maxPrice} 
                      step={1} 
                      value={priceRange}
                      onValueChange={handlePriceChange}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">${priceRange[0]}</span>
                      <span className="text-sm">${priceRange[1]}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Categories */}
                  <div>
                    <h3 className="font-medium mb-2">Categories</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {allCategories.map(category => (
                        <div key={category} className="flex items-center">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryToggle(category)}
                          />
                          <label
                            htmlFor={`category-${category}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Brands */}
                  <div>
                    <h3 className="font-medium mb-2">Brands</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {allBrands.map(brand => (
                        <div key={brand} className="flex items-center">
                          <Checkbox
                            id={`brand-${brand}`}
                            checked={selectedBrands.includes(brand)}
                            onCheckedChange={() => handleBrandToggle(brand)}
                          />
                          <label
                            htmlFor={`brand-${brand}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Sort By */}
                  <div>
                    <h3 className="font-medium mb-2">Sort By</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="sort-popularity"
                          checked={sortBy === 'popularity'}
                          onChange={() => setSortBy('popularity')}
                          className="mr-2"
                        />
                        <label htmlFor="sort-popularity">Popularity</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="sort-price-low-high"
                          checked={sortBy === 'price-low-high'}
                          onChange={() => setSortBy('price-low-high')}
                          className="mr-2"
                        />
                        <label htmlFor="sort-price-low-high">Price: Low to High</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="sort-price-high-low"
                          checked={sortBy === 'price-high-low'}
                          onChange={() => setSortBy('price-high-low')}
                          className="mr-2"
                        />
                        <label htmlFor="sort-price-high-low">Price: High to Low</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="sort-rating"
                          checked={sortBy === 'rating'}
                          onChange={() => setSortBy('rating')}
                          className="mr-2"
                        />
                        <label htmlFor="sort-rating">Highest Rated</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <SheetFooter className="flex gap-3 flex-row sm:justify-between">
                  <Button variant="outline" onClick={clearAllFilters} className="w-1/2">
                    Clear All
                  </Button>
                  <SheetClose asChild>
                    <Button className="w-1/2 bg-brand-blue hover:bg-brand-darkBlue">Apply</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Active Filters */}
          {getTotalFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedCategories.map(category => (
                <Badge 
                  key={`cat-${category}`} 
                  variant="secondary"
                  className="flex items-center px-2 py-1"
                >
                  <span>{category}</span>
                  <button onClick={() => handleCategoryToggle(category)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedBrands.map(brand => (
                <Badge 
                  key={`brand-${brand}`} 
                  variant="secondary"
                  className="flex items-center px-2 py-1"
                >
                  <span>{brand}</span>
                  <button onClick={() => handleBrandToggle(brand)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
                <Badge 
                  variant="secondary"
                  className="flex items-center px-2 py-1"
                >
                  <span>${priceRange[0]} - ${priceRange[1]}</span>
                  <button onClick={() => setPriceRange([minPrice, maxPrice])} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-gray-500 text-xs hover:bg-transparent hover:text-gray-700 px-2 h-auto"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
        
        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-500">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
        </div>
        
        {/* Product Grid */}
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} showBuyNow={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <SearchIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium mb-2">No products found</h2>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <Button onClick={clearAllFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default SearchPage;

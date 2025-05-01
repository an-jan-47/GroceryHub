
import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
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
import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

// Sample data for demonstration
const PRODUCTS = [
  { 
    id: '1', 
    name: 'Wireless Headphones', 
    price: 79.99, 
    image: '/placeholder.svg', 
    category: 'Audio',
    brand: 'SoundWave',
    rating: 4.5
  },
  { 
    id: '2', 
    name: 'Smart Watch Pro', 
    price: 299.99, 
    salePrice: 249.99, 
    image: '/placeholder.svg', 
    category: 'Wearables',
    brand: 'TechWear',
    rating: 4.7
  },
  { 
    id: '3', 
    name: 'Portable Speaker', 
    price: 89.99, 
    image: '/placeholder.svg', 
    category: 'Audio',
    brand: 'SoundWave',
    rating: 4.3
  },
  { 
    id: '4', 
    name: 'White Sneakers', 
    price: 59.99, 
    image: '/placeholder.svg', 
    category: 'Fashion',
    brand: 'UrbanStride',
    rating: 4.1
  },
  { 
    id: '5', 
    name: 'Wireless Earbuds', 
    price: 129.99, 
    salePrice: 99.99, 
    image: '/placeholder.svg', 
    category: 'Audio',
    brand: 'AudioTech',
    rating: 4.6
  },
  { 
    id: '6', 
    name: 'Smartphone X', 
    price: 899.99, 
    image: '/placeholder.svg', 
    category: 'Electronics',
    brand: 'TechPro',
    rating: 4.8
  },
  { 
    id: '7', 
    name: 'Fitness Tracker', 
    price: 79.99, 
    image: '/placeholder.svg', 
    category: 'Wearables',
    brand: 'FitTech',
    rating: 4.2
  },
  { 
    id: '8', 
    name: 'Laptop Pro', 
    price: 1299.99, 
    salePrice: 1199.99, 
    image: '/placeholder.svg', 
    category: 'Electronics',
    brand: 'TechPro',
    rating: 4.9
  },
];

// Extract unique categories and brands
const CATEGORIES = [...new Set(PRODUCTS.map(product => product.category))];
const BRANDS = [...new Set(PRODUCTS.map(product => product.brand))];

const ExplorePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { toast } = useToast();
  
  // Parse query params
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('query') || '';
  const initialCategory = queryParams.get('category') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);
  
  // Apply filters and search
  useEffect(() => {
    let results = [...PRODUCTS];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(query) || 
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
      const price = product.salePrice ?? product.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low-high':
        results.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price-high-low':
        results.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      // 'popularity' is default (no sort)
      default:
        break;
    }
    
    setFilteredProducts(results);
  }, [searchQuery, selectedCategories, selectedBrands, priceRange, sortBy]);
  
  useEffect(() => {
    // Update URL with filters for sharing/bookmarking
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (selectedCategories.length === 1) params.set('category', selectedCategories[0]);
    navigate(`/explore?${params.toString()}`, { replace: true });
  }, [searchQuery, selectedCategories, navigate]);
  
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
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 1500]);
    setSortBy('popularity');
    navigate('/explore', { replace: true });
  };
  
  const getTotalFiltersCount = () => {
    return (searchQuery ? 1 : 0) + 
           selectedCategories.length + 
           selectedBrands.length + 
           (priceRange[0] > 0 || priceRange[1] < 1500 ? 1 : 0);
  };
  
  const getProductQuantityInCart = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };
  
  const handleAddToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
      toast({
        title: "Updated cart quantity",
        description: `${product.name} quantity updated to ${existingItem.quantity + 1}`,
      });
    } else {
      addToCart(product);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    }
  };
  
  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                placeholder="Explore products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
              {searchQuery && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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
                      defaultValue={[0, 1500]} 
                      max={1500} 
                      step={10} 
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
                    <div className="space-y-2">
                      {CATEGORIES.map(category => (
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
                    <div className="space-y-2">
                      {BRANDS.map(brand => (
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
              {searchQuery && (
                <Badge 
                  variant="secondary"
                  className="flex items-center px-2 py-1"
                >
                  <span>Search: {searchQuery}</span>
                  <button onClick={() => setSearchQuery('')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
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
              {(priceRange[0] > 0 || priceRange[1] < 1500) && (
                <Badge 
                  variant="secondary"
                  className="flex items-center px-2 py-1"
                >
                  <span>${priceRange[0]} - ${priceRange[1]}</span>
                  <button onClick={() => setPriceRange([0, 1500])} className="ml-1">
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
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card animate-fade-in border rounded-lg overflow-hidden shadow-sm">
                <a href={`/product/${product.id}`}>
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-40 object-cover"
                    />
                    {product.salePrice && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Sale
                      </div>
                    )}
                  </div>
                </a>
                <div className="p-3">
                  <a href={`/product/${product.id}`} className="block">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                    <div className="flex items-center mt-1">
                      {Array(5).fill(0).map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                      <span className="text-xs ml-1">{product.rating}</span>
                    </div>
                  </a>
                  <div className="mt-2">
                    {product.salePrice ? (
                      <div className="flex items-center">
                        <span className="font-bold text-brand-blue">${product.salePrice.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 line-through ml-1">${product.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="font-bold">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  
                  {getProductQuantityInCart(product.id) > 0 ? (
                    <div className="w-full flex items-center mt-2 border rounded-md">
                      <button
                        onClick={() => updateQuantity(product.id, getProductQuantityInCart(product.id) - 1)}
                        className="p-2 text-gray-600 hover:text-brand-blue"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-center">{getProductQuantityInCart(product.id)}</span>
                      <button
                        onClick={() => updateQuantity(product.id, getProductQuantityInCart(product.id) + 1)}
                        className="p-2 text-gray-600 hover:text-brand-blue"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </div>
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

export default ExplorePage;


import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ProductCard from '@/components/ProductCard';
import { getCategories } from '@/services/categoryService';
import { getProducts, searchProducts, Product } from '@/services/productService';
import { useQuery } from '@tanstack/react-query';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 5000 });
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Fetch all products for filtering
  const { data: allProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['all-products'],
    queryFn: getProducts,
  });

  // Extract unique brands from products
  const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];

  // Search and filter products
  useEffect(() => {
    let products = allProducts;

    // Apply search query
    if (searchQuery.trim()) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      products = products.filter(product => product.category === selectedCategory);
    }

    // Apply brand filter
    if (selectedBrand) {
      products = products.filter(product => product.brand === selectedBrand);
    }

    // Apply price range filter
    products = products.filter(product => {
      const price = product.salePrice || product.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Apply sorting
    products.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'price':
          aValue = a.salePrice || a.price;
          bValue = b.salePrice || b.price;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProducts(products);
  }, [allProducts, searchQuery, selectedCategory, selectedBrand, priceRange, sortBy, sortOrder]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearchParams({ query });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: 0, max: 5000 });
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = selectedCategory || selectedBrand || priceRange.min > 0 || priceRange.max < 5000;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-3">Category</h3>
        <div className="space-y-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('')}
            className="w-full justify-start"
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.name)}
              className="w-full justify-start"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brand Filter */}
      <div>
        <h3 className="font-semibold mb-3">Brand</h3>
        <div className="space-y-2">
          <Button
            variant={selectedBrand === '' ? 'default' : 'outline'}
            onClick={() => setSelectedBrand('')}
            className="w-full justify-start"
          >
            All Brands
          </Button>
          {brands.map((brand) => (
            <Button
              key={brand}
              variant={selectedBrand === brand ? 'default' : 'outline'}
              onClick={() => setSelectedBrand(brand)}
              className="w-full justify-start"
            >
              {brand}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Sort Options */}
      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <div className="space-y-2">
          <Button
            variant={sortBy === 'name' && sortOrder === 'asc' ? 'default' : 'outline'}
            onClick={() => { setSortBy('name'); setSortOrder('asc'); }}
            className="w-full justify-start"
          >
            Name (A-Z)
          </Button>
          <Button
            variant={sortBy === 'name' && sortOrder === 'desc' ? 'default' : 'outline'}
            onClick={() => { setSortBy('name'); setSortOrder('desc'); }}
            className="w-full justify-start"
          >
            Name (Z-A)
          </Button>
          <Button
            variant={sortBy === 'price' && sortOrder === 'asc' ? 'default' : 'outline'}
            onClick={() => { setSortBy('price'); setSortOrder('asc'); }}
            className="w-full justify-start"
          >
            Price (Low to High)
          </Button>
          <Button
            variant={sortBy === 'price' && sortOrder === 'desc' ? 'default' : 'outline'}
            onClick={() => { setSortBy('price'); setSortOrder('desc'); }}
            className="w-full justify-start"
          >
            Price (High to Low)
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header />
      
      <div className="bg-white sticky top-16 z-10 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Filter */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="hidden md:flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1">
                      {[selectedCategory, selectedBrand, priceRange.min > 0 || priceRange.max < 5000 ? 'Price' : null]
                        .filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Filters</DialogTitle>
                </DialogHeader>
                <FilterContent />
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>{selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedBrand && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>{selectedBrand}</span>
                  <button onClick={() => setSelectedBrand('')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {(priceRange.min > 0 || priceRange.max < 5000) && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>₹{priceRange.min} - ₹{priceRange.max}</span>
                  <button onClick={() => setPriceRange({ min: 0, max: 5000 })}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="container px-4 py-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <span className="text-sm text-gray-500">
            {filteredProducts.length} products found
          </span>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <SearchIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium mb-2">No products found</h2>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? `We couldn't find any products matching "${searchQuery}"`
                : "No products match your current filters"
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default SearchPage;

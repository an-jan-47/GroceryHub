
import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/services/productService';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Product } from '@/types/product';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  });

  const categories = useMemo(() => {
    if (!products || products.length === 0) return [];
    const categorySet = new Set(products.map((product: Product) => product.category));
    return Array.from(categorySet);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    let filtered = products as Product[];

    if (searchTerm) {
      filtered = filtered.filter((product: Product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product: Product) => product.category === selectedCategory);
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter((product: Product) => {
        const price = product.sale_price || product.price;
        switch (priceRange) {
          case 'under-50': return price < 50;
          case '50-100': return price >= 50 && price <= 100;
          case '100-200': return price > 100 && price <= 200;
          case 'over-200': return price > 200;
          default: return true;
        }
      });
    }

    return filtered.sort((a: Product, b: Product) => {
      switch (sortBy) {
        case 'price-low': return (a.sale_price || a.price) - (b.sale_price || b.price);
        case 'price-high': return (b.sale_price || b.price) - (a.sale_price || a.price);
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const updateSearchParams = useCallback((updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    updateSearchParams({ q: value });
  }, [updateSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('name');
    setSearchParams({});
  }, [setSearchParams]);

  const activeFiltersCount = useMemo(() => {
    return [selectedCategory, priceRange, sortBy].filter(f => f !== 'all' && f !== 'name').length;
  }, [selectedCategory, priceRange, sortBy]);

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              updateSearchParams({ category: value });
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={(value) => {
              setPriceRange(value);
              updateSearchParams({ price: value });
            }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-50">Under ₹50</SelectItem>
                <SelectItem value="50-100">₹50 - ₹100</SelectItem>
                <SelectItem value="100-200">₹100 - ₹200</SelectItem>
                <SelectItem value="over-200">Over ₹200</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value);
              updateSearchParams({ sort: value });
            }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
            
            {searchTerm && (
              <Badge variant="secondary">
                Searching: "{searchTerm}"
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={`search-loading-${i}`} className="space-y-2">
                  <div className="h-40 w-full bg-gray-200 animate-pulse rounded-md" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                    <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
  <div key={product.id}>
    <ProductCard product={product} />
  </div>
))}

))}

              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default SearchPage;

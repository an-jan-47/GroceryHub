
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Filter } from 'lucide-react';
import ProductsGrid from '@/components/ProductsGrid';
import { Product } from '@/types';
import { searchProducts } from '@/services/productService';
import SearchFilters from '@/components/SearchFilters';
import { SearchFiltersType } from '@/services/searchService';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchInitialProducts = async () => {
      setIsLoading(true);
      try {
        const initialProducts = await searchProducts(searchTerm);
        setProducts(initialProducts);
        setFilteredProducts(initialProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialProducts();
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (filters: SearchFiltersType) => {
    const filtered = products.filter((product: Product) => {
      if (filters.minPrice && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (filters.brands && filters.brands.length > 0) {
        if (!filters.brands.includes(product.brand)) {
          return false;
        }
      }
      if (filters.inStock && product.stock === 0) {
        return false;
      }
      return true;
    });
    setFilteredProducts(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-4">
        <Input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="mr-2"
        />
        <Button>
          <SearchIcon className="w-5 h-5" />
        </Button>
        <Button variant="outline" className="ml-2" onClick={toggleFilter}>
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </Button>
      </div>

      {isFilterOpen && (
        <div className="mb-4">
          <SearchFilters
            onFilterChange={handleFilterChange}
            initialFilters={{
              query: searchTerm,
              category: '',
              minPrice: 0,
              maxPrice: 10000,
              sortBy: 'name',
              sortOrder: 'asc',
              brands: [],
              inStock: false
            }}
          />
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <ProductsGrid products={filteredProducts} />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Search;

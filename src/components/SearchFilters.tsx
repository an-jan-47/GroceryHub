
import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/categoryService';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

interface SearchFiltersComponentProps {
  onFilterChange: (filters: SearchFilters) => void;
  initialQuery?: string;
  initialCategory?: string;
}

const SearchFiltersComponent: React.FC<SearchFiltersComponentProps> = ({
  onFilterChange,
  initialQuery = '',
  initialCategory = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('name');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // Memoized filter change handler to prevent infinite loops
  const handleFilterChange = useCallback((filters: SearchFilters) => {
    onFilterChange(filters);
  }, [onFilterChange]);

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedCategory(initialCategory || 'all');
  }, [initialCategory]);

  // Debounced effect to prevent rapid filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters = {
        query: searchTerm,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
        sortBy: sortBy === 'name' ? '' : sortBy
      };
      
      handleFilterChange(filters);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, priceRange, sortBy, handleFilterChange]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, 10000]);
    setSortBy('name');
    setIsFilterOpen(false);
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative flex items-center">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 w-full"
          />
        </div>
        
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-2">
              <Filter className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] animate-slide-in-right">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Category</h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Price Range</h3>
                  <span className="text-sm text-gray-500">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                </div>
                <Slider
                  value={priceRange}
                  min={0}
                  max={10000}
                  step={100}
                  onValueChange={setPriceRange}
                  className="py-4"
                />
              </div>
              
              {/* Remove the Sort By section */}
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
                <Button onClick={clearFilters} variant="outline" className="flex-1">Clear</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default SearchFiltersComponent;

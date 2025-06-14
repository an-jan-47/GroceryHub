
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface SearchFilters {
  query?: string;
  category?: string;
  priceRange?: string;
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
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Available categories (in a real app, this would come from your backend)
  const categories = ['Nestle', 'Cadbury', 'Haldiram', 'Books', 'Sports', 'Beauty'];

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedCategory(initialCategory || 'all');
  }, [initialCategory]);

  useEffect(() => {
    onFilterChange({
      query: searchTerm,
      category: selectedCategory === 'all' ? '' : selectedCategory,
      priceRange: priceRange === 'all' ? '' : priceRange,
      sortBy: sortBy === 'name' ? '' : sortBy
    });
  }, [searchTerm, selectedCategory, priceRange, sortBy, onFilterChange]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('name');
  };

  const activeFiltersCount = [
    selectedCategory !== 'all' ? selectedCategory : null,
    priceRange !== 'all' ? priceRange : null,
    sortBy !== 'name' ? sortBy : null
  ].filter(Boolean).length;

  return (
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
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

        <Select value={priceRange} onValueChange={setPriceRange}>
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

        <Select value={sortBy} onValueChange={setSortBy}>
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

      {(searchTerm || selectedCategory !== 'all') && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary">
              Search: "{searchTerm}"
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary">
              Category: {selectedCategory}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFiltersComponent;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/searchService';

interface SearchFiltersProps {
  onFilterChange: (filters: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
  initialQuery?: string;
}

const SearchFilters = ({ onFilterChange, initialQuery = '' }: SearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleSearch = () => {
    onFilterChange({
      query: query.trim() || undefined,
      category: category === 'all' ? undefined : category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Filters</h3>
            <Button onClick={() => setShowFilters(false)} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="minPrice">Min Price (₹)</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="maxPrice">Max Price (₹)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1">
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="outline">
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, Search as SearchIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/categoryService';
import { Slider } from "@/components/ui/slider";

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
  const [priceRange, setPriceRange] = useState([0, 10000]);
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });
  
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    applyFilters(value);
  };

  const applyFilters = (priceValues = priceRange) => {
    onFilterChange({
      query: query.trim() || undefined,
      category: category === 'all' ? undefined : category,
      minPrice: priceValues[0],
      maxPrice: priceValues[1]
    });
  };

  const handleSearch = () => {
    applyFilters();
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setPriceRange([0, 10000]);
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 border-blue-200 focus:border-blue-400 rounded-full"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
        </div>
        <Button 
          onClick={() => setShowFilters(!showFilters)} 
          variant="outline" 
          size="icon"
          className="rounded-full border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-md space-y-4 border border-blue-100">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-800">Filters</h3>
            <Button onClick={() => setShowFilters(false)} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="category" className="text-gray-700">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1 border-blue-200 focus:border-blue-400 rounded-lg">
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
            
            <div className="space-y-2">
              <Label className="text-gray-700">Price Range</Label>
              <div className="pt-6 px-2">
                <Slider
                  defaultValue={[0, 10000]}
                  max={10000}
                  step={100}
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSearch} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Apply Filters
              </Button>
              <Button 
                onClick={clearFilters} 
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;

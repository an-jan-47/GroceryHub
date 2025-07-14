
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { SearchFiltersType, SearchFiltersProps } from '@/services/searchService';

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onFilterChange, 
  initialQuery = '', 
  initialCategory = 'all',
  categories = [],
  brands = []
}) => {
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: initialQuery,
    category: initialCategory,
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'name',
    sortOrder: 'asc',
    brands: [],
    inStock: false,
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const newFilters = {
      ...filters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      brands: selectedBrands,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [priceRange, selectedBrands]);

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFiltersType = {
      query: '',
      category: 'all',
      minPrice: 0,
      maxPrice: 10000,
      sortBy: 'name',
      sortOrder: 'asc',
      brands: [],
      inStock: false,
    };
    setFilters(clearedFilters);
    setPriceRange([0, 10000]);
    setSelectedBrands([]);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = [
    filters.query,
    filters.category !== 'all' ? filters.category : null,
    priceRange[0] > 0 || priceRange[1] < 10000 ? 'price' : null,
    selectedBrands.length > 0 ? 'brands' : null,
    filters.inStock ? 'inStock' : null,
  ].filter(Boolean).length;

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Search Query */}
            <div className="space-y-2">
              <Label htmlFor="search-query">Search</Label>
              <Input
                id="search-query"
                type="text"
                placeholder="Search products..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</Label>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                max={10000}
                min={0}
                step={100}
                className="w-full"
              />
            </div>

            {/* Brands Filter */}
            {brands.length > 0 && (
              <div className="space-y-2">
                <Label>Brands</Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => handleBrandToggle(brand)}
                      />
                      <Label htmlFor={`brand-${brand}`} className="text-sm">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value: 'name' | 'price' | 'rating') => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Order</Label>
                <Select value={filters.sortOrder} onValueChange={(value: 'asc' | 'desc') => handleFilterChange('sortOrder', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* In Stock Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock}
                onCheckedChange={(checked) => handleFilterChange('inStock', !!checked)}
              />
              <Label htmlFor="in-stock">In Stock Only</Label>
            </div>

            {/* Clear Filters */}
            <Button onClick={clearFilters} variant="outline" size="sm" className="w-full">
              Clear All Filters
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SearchFilters;

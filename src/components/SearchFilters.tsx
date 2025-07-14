
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { X, Search, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SearchFiltersType } from '@/services/searchService';

export interface SearchFiltersProps {
  onFilterChange: (filters: SearchFiltersType) => void;
  initialQuery?: string;
  initialCategory?: string;
  categories?: string[];
  brands?: string[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onFilterChange, 
  initialQuery = '',
  initialCategory = '',
  categories = [],
  brands = []
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [rating, setRating] = useState(0);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'name'>('name');

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const handleFilterChange = () => {
    const filters: SearchFiltersType = {
      query: searchQuery,
      category: selectedCategory,
      brands: selectedBrands,
      priceRange,
      rating,
      sortBy,
    };
    onFilterChange(filters);
  };

  useEffect(() => {
    handleFilterChange();
  }, [searchQuery, selectedCategory, selectedBrands, priceRange, rating, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrands([]);
    setPriceRange([0, 5000]);
    setRating(0);
    setSortBy('name');
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mobile Filter Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your search with these filters
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    <Button
                      variant={selectedCategory === '' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('')}
                      className="w-full justify-start"
                    >
                      All Categories
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="w-full justify-start"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Brands</h3>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((brand) => (
                      <Badge
                        key={brand}
                        variant={selectedBrands.includes(brand) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleBrand(brand)}
                      >
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="px-3">
                  <Slider
                    value={priceRange}
                    onValueChange={(value: number[]) => setPriceRange(value as [number, number])}
                    max={5000}
                    min={0}
                    step={50}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-medium mb-3">Minimum Rating</h3>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Button
                      key={star}
                      variant={rating === star ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRating(star)}
                    >
                      {star === 0 ? 'Any' : `${star}+ ⭐`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="font-medium mb-3">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { value: 'name', label: 'Name' },
                    { value: 'price_asc', label: 'Price: Low to High' },
                    { value: 'price_desc', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Rating' },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy(option.value as any)}
                      className="w-full justify-start"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={clearFilters} variant="outline" className="w-full">
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block space-y-6">
        {/* Similar content as mobile but in different layout */}
        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === '' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory('')}
              >
                All
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Show active filters */}
        {(selectedCategory || selectedBrands.length > 0 || rating > 0) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Active Filters</h3>
              <Button onClick={clearFilters} variant="ghost" size="sm">
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory('')}>
                  {selectedCategory} <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {selectedBrands.map((brand) => (
                <Badge key={brand} variant="secondary" className="cursor-pointer" onClick={() => toggleBrand(brand)}>
                  {brand} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              {rating > 0 && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setRating(0)}>
                  {rating}+ Rating <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;

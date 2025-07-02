import React, { forwardRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFiltersProps {
  onFiltersChange?: (filters: any) => void;
}

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState<string>("");
  
  const handlePriceChange = (value: number[]) => {
    if (value.length === 2) {
      setPriceRange([value[0], value[1]]);
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const applyFilters = () => {
    const filters = {
      priceRange,
      categories: selectedCategories,
      sortBy
    };
    onFiltersChange?.(filters);
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    setSortBy("");
    onFiltersChange?.({
      priceRange: [0, 1000],
      categories: [],
      sortBy: ""
    });
  };

  const categories = [
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Meat & Seafood",
    "Bakery",
    "Pantry",
    "Beverages",
    "Snacks",
    "Personal Care"
  ];

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Price Range</label>
        <Slider
          value={priceRange}
          onValueChange={handlePriceChange}
          max={1000}
          min={0}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Categories</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => 
                  handleCategoryChange(category, checked as boolean)
                }
              />
              <Label htmlFor={category} className="text-sm">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Sort By</label>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select sorting option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 border-t">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

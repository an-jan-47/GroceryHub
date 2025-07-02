
import React from "react";
import { Home, Search, ShoppingCart, User } from "lucide-react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/cart", icon: ShoppingCart, label: "Cart" },
  { to: "/profile", icon: User, label: "Profile" },
]

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center space-y-1 text-xs",
                isActive ? "text-primary" : "text-gray-500"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

// Also export as named export for compatibility
export { BottomNavigation };
</rov-write>

Now let me fix the SearchFilters component to have default export:

<lov-write file_path="src/components/SearchFilters.tsx">
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export interface SearchFiltersType {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface SearchFiltersProps {
  onFilterChange?: (filters: SearchFiltersType) => void;
  initialQuery?: string;
  initialCategory?: string;
}

export default function SearchFilters({ onFilterChange, initialQuery = "", initialCategory = "" }: SearchFiltersProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();

  const handleSearch = () => {
    const filters: SearchFiltersType = {
      query: query || undefined,
      category: category || undefined,
      minPrice,
      maxPrice
    };
    onFilterChange?.(filters);
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
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex gap-2">
        <Input
          placeholder="Search products..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Min Price"
          value={minPrice || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setMinPrice(e.target.value ? Number(e.target.value) : undefined)
          }
        />

        <Input
          type="number"
          placeholder="Max Price"
          value={maxPrice || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
          }
        />
      </div>
    </div>
  );
}

// Also export as named export for compatibility
export { SearchFilters };

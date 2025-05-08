
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductsGrid from '@/components/ProductsGrid';
import PopularProducts from '@/components/PopularProducts';

const Explore = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 pt-2 pb-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <form onSubmit={handleSearch} className="w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 pr-12 py-6"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </form>
          </div>
        </div>
        
        {/* Popular Products Section */}
        <PopularProducts />
        
        {/* Featured Categories */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Audio', 'Electronics', 'Fashion', 'Wearables'].map(category => (
              <Button 
                key={category}
                variant="outline"
                className="py-8 flex flex-col items-center justify-center text-lg"
                onClick={() => navigate(`/search?category=${category}`)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {/* All Products */}
        <div className="mt-8">
          <ProductsGrid title="All Products" limit={8} />
          <div className="flex justify-center mt-6">
            <Button 
              onClick={() => navigate('/search')} 
              variant="outline"
              className="border-brand-blue text-brand-blue"
            >
              View All Products
            </Button>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Explore;

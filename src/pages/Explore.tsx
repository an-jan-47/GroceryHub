
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductsGrid from '@/components/ProductsGrid';
import { getProducts, Product } from '@/services/productService';

const Explore = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Get the query parameter if available
    const queryParam = searchParams.get('query');
    if (queryParam) {
      setSearchTerm(queryParam);
    }

    // Get category parameter if available
    const categoryParam = searchParams.get('category');
    
    // Fetch products
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        
        // Apply initial filters if needed
        if (queryParam || categoryParam) {
          const filtered = data.filter(product => {
            const matchesQuery = queryParam ? 
              product.name.toLowerCase().includes(queryParam.toLowerCase()) || 
              product.description.toLowerCase().includes(queryParam.toLowerCase()) || 
              product.brand.toLowerCase().includes(queryParam.toLowerCase()) : 
              true;
              
            const matchesCategory = categoryParam ? 
              product.category.toLowerCase() === categoryParam.toLowerCase() : 
              true;
              
            return matchesQuery && matchesCategory;
          });
          setFilteredProducts(filtered);
        } else {
          setFilteredProducts(data);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [searchParams]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Filter products when search term changes
  useEffect(() => {
    if (products.length > 0 && searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);
  
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
        
        {/* All Products */}
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
            </div>
          ) : (
            <ProductsGrid 
              title="All Products" 
              showCount={true}
              customProducts={filteredProducts}
            />
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Explore;

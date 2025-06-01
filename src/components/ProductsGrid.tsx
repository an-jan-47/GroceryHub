
import { useState, useEffect } from 'react';
import { getProducts, getProductCount, subscribeToProductChanges, Product } from '@/services/productService';
import ProductCard from '@/components/ProductCard';

interface ProductsGridProps {
  category?: string;
  limit?: number;
  title?: string;
  showCount?: boolean;
  customProducts?: Product[];
}

const ProductsGrid = ({ category, limit, title = 'Products', showCount = true, customProducts }: ProductsGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // If customProducts are provided, use them directly
    if (customProducts) {
      setProducts(customProducts);
      setProductCount(customProducts.length);
      setIsLoading(false);
      return;
    }
    
    // Otherwise, subscribe to product changes
    const unsubscribe = subscribeToProductChanges((updatedProducts) => {
      let filteredProducts = updatedProducts;
      
      // If category is specified, filter products
      if (category) {
        filteredProducts = updatedProducts.filter(p => p.category === category);
      }
      
      // If limit is specified, limit the number of products
      if (limit) {
        filteredProducts = filteredProducts.slice(0, limit);
      }
      
      setProducts(filteredProducts);
      setProductCount(updatedProducts.length);
      setIsLoading(false);
    });
    
    // Get initial product count
    getProductCount().then(count => {
      setProductCount(count);
    });
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [category, limit, customProducts]);
  
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {showCount && (
            <span className="text-sm text-gray-500">{productCount} products found</span>
          )}
        </div>
      )}
      
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-6 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;

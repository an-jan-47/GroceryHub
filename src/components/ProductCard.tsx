
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/services/productService';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  showBuyNow?: boolean;
}

const ProductCard = ({ product, className, showBuyNow = false }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price,
      images: product.images,
      quantity: 1,
      stock: product.stock
    });
  };
  
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to cart first
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price,
      images: product.images,
      quantity: 1,
      stock: product.stock
    });
    
    // Navigate to cart
    navigate('/cart');
  };
  
  // Calculate discount percentage if there's a sale price
  const discountPercentage = product.sale_price 
    ? Math.round((1 - product.sale_price / product.price) * 100) 
    : null;
  
  return (
    <div className={cn("bg-white border rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md", className)}>
      <Link to={`/product/${product.id}`} className="block relative pt-[100%]">
        <img 
          src={product.images?.[0]} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-contain p-2"
        />
        {product.sale_price && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            {discountPercentage}% OFF
          </div>
        )}
      </Link>
      <div className="p-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 h-10">{product.name}</h3>
          <p className="text-xs text-gray-500">{product.brand}</p>
          <div className="flex items-center mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating) 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs ml-1">{product.rating.toFixed(1)}</span>
            </div>
          </div>
        </Link>
        <div className="mt-2">
          {product.sale_price ? (
            <div className="flex items-center">
              <span className="font-bold text-blue-600">${product.sale_price.toFixed(2)}</span>
              <span className="text-xs text-gray-500 line-through ml-1">${product.price.toFixed(2)}</span>
            </div>
          ) : (
            <span className="font-bold">${product.price.toFixed(2)}</span>
          )}
        </div>
        <div className={`mt-2 ${showBuyNow ? 'grid grid-cols-2 gap-2' : ''}`}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`${showBuyNow ? 'w-full' : 'w-full'} border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white`}
          >
            {product.stock <= 0 ? 'Out of Stock' : (
              <>
                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                Add to Cart
              </>
            )}
          </Button>
          
          {showBuyNow && (
            <Button
              size="sm"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Buy Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

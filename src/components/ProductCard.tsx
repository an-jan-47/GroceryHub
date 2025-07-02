import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/services/productService';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface ProductCardProps {
  product: Product;
  className?: string;
  showBuyNow?: boolean;
}

// Update the discount percentage calculation in the ProductCard component
const ProductCard = ({ product, className, showBuyNow = false }: ProductCardProps) => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const navigate = useNavigate();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      toast("Out of stock", {
        description: `${product.name} is currently unavailable`,
      });
      return;
    }
    
    // Get current quantity in cart or default to 0
    const currentQty = getQuantityInCart();
    // If already in cart, increment by 1, otherwise add with quantity 1
    const newQty = currentQty > 0 ? currentQty + 1 : 1;
    
    // Make sure we don't exceed stock
    const finalQty = Math.min(newQty, product.stock);
    
    addToCart(product, finalQty);
    
    toast("Added to cart", {
      description: `${finalQty} × ${product.name}`,
    });
  };
  
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      toast("Out of stock", {
        description: `${product.name} is currently unavailable`,
        position: "bottom-center"
      });
      return;
    }
    
    // Add to cart first
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      sale_price: product.sale_price,
      images: product.images,
      quantity: 1,
      stock: product.stock
    });
    
    // Navigate to address selection for buy now
    navigate('/address');
  };
  
  // Get quantity in cart
  const getQuantityInCart = () => {
    const item = cartItems.find(item => item.id === product.id);
    return item ? item.quantity : 0;
  };
  
  const quantityInCart = getQuantityInCart();
  
  // Calculate discount percentage if there's a sale price - FIX THE CALCULATION
  const discountPercentage = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100) 
    : null;
  
  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md flex flex-col h-full", 
      className
    )}>
      <Link 
        to={`/product/${product.id}`} 
        className="block relative pt-[100%] overflow-hidden"
      >
        <img 
          src={product.images?.[0]} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-contain p-1 transition-transform duration-300 hover:scale-105"
        />
        {product.sale_price && (
          <div className="absolute top-1 right-1 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
            {discountPercentage}% OFF
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute top-1 left-1 bg-gray-800 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
            Out of Stock
          </div>
        )}
      </Link>
      <div className="p-2 flex-grow flex flex-col justify-between">
        <div>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-xs line-clamp-2 hover:text-blue-600 transition-colors">{product.name}</h3>
            <p className="text-xs text-gray-500 truncate">{product.brand}</p>
            <div className="flex items-center mt-0.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-xs ml-1 text-gray-600">{product.rating.toFixed(1)}</span>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="mt-auto pt-1">
          <div className="mb-1.5">
            {product.sale_price ? (
              <div className="flex items-center">
                <span className="font-bold text-sm text-blue-600">₹{product.sale_price.toFixed(2)}</span>
                <span className="text-xs text-gray-500 line-through ml-1">₹{product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="font-bold text-sm text-blue-600">₹{product.price.toFixed(2)}</span>
            )}
          </div>
          
          <div className={`${showBuyNow && quantityInCart === 0 ? 'grid grid-cols-2 gap-1' : ''}`}>
            {quantityInCart > 0 ? (
              <div className="w-full flex items-center border rounded-md">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQuantity(product.id, quantityInCart - 1);
                  }}
                  className="p-1 text-gray-600 hover:text-blue-500 flex-shrink-0"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="flex-1 text-center text-xs">{quantityInCart}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQuantity(product.id, quantityInCart + 1);
                  }}
                  className="p-1 text-gray-600 hover:text-blue-500 flex-shrink-0"
                  disabled={product.stock <= 0 || quantityInCart >= product.stock}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`${showBuyNow ? 'w-full' : 'w-full'} border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white h-7 text-xs`}
                >
                  {product.stock <= 0 ? 'Out of Stock' : (
                    <>
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add to Cart
                    </>
                  )}
                </Button>
                
                {showBuyNow && product.stock > 0 && (
                  <Button
                    size="sm"
                    onClick={handleBuyNow}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs"
                  >
                    Buy Now
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

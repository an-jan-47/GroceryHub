
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import React from "react";
import { toast } from '@/components/ui/sonner';

interface ProductDetailActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    sale_price?: number;
    stock: number;
    images?: string[];
  };
  quantity: number;
  onAddToCart: (quantity: number) => void;
  onBuyNow: (quantity: number) => void;
}

const ProductDetailActions = ({ 
  product, 
  quantity, 
  onAddToCart, 
  onBuyNow 
}: ProductDetailActionsProps) => {
  
  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast("Out of stock", {
        description: `${product.name} is currently unavailable`,
        position: "bottom-center"
      });
      return;
    }
    
    if (quantity > product.stock) {
      toast("Insufficient stock", {
        description: `Only ${product.stock} units available`,
        position: "bottom-center"
      });
      return;
    }
    
    onAddToCart(quantity);
  };
  
  const handleBuyNow = () => {
    if (product.stock <= 0) {
      toast("Out of stock", {
        description: `${product.name} is currently unavailable`,
        position: "bottom-center"
      });
      return;
    }
    
    if (quantity > product.stock) {
      toast("Insufficient stock", {
        description: `Only ${product.stock} units available`,
        position: "bottom-center"
      });
      return;
    }
    
    onBuyNow(quantity);
  };
  
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <Button 
        variant="outline" 
        onClick={handleAddToCart}
        disabled={product.stock <= 0}
        className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
      </Button>
      
      <Button 
        onClick={handleBuyNow}
        disabled={product.stock <= 0}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {product.stock <= 0 ? 'Out of Stock' : 'Buy Now'}
      </Button>
    </div>
  );
};

export default ProductDetailActions;

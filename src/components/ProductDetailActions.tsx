
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import React from "react";

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
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <Button 
        variant="outline" 
        onClick={() => onAddToCart(quantity)}
        disabled={product.stock <= 0}
        className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Add to Cart
      </Button>
      
      <Button 
        onClick={() => onBuyNow(quantity)}
        disabled={product.stock <= 0}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Buy Now
      </Button>
    </div>
  );
};

export default ProductDetailActions;

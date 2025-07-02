import React, { useState } from "react";

import { Button } from '@/components/ui/button';
import { Heart, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface ProductDetailImageProps {
  product: {
    id: string;
    name: string;
    images?: string[];
    sale_price?: number;
    price: number;
  };
  isFavorite: boolean;
  onToggleWishlist: () => void;
}

const ProductDetailImage = ({ product, isFavorite, onToggleWishlist }: ProductDetailImageProps) => {
  // Calculate discount percentage
  const discountPercentage = product?.sale_price && product?.price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : null;

  // Share product function
  const shareProduct = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on GroceryHub!`,
      url: window.location.href,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast('Shared successfully', {
          description: 'Product has been shared',
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast('Link copied', {
          description: 'Product link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast('Sharing failed', {
        description: 'Could not share the product',
      });
    }
  };

  return (
    <div className="mb-4 rounded-lg overflow-hidden bg-white relative">
      <img 
        src={product.images?.[0] || '/placeholder.svg'} 
        alt={product.name} 
        className="w-full h-64 object-contain"
      />
      
      {/* Action buttons for wishlist and share */}
      <div className="absolute top-2 right-2 flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full bg-white ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}
          onClick={onToggleWishlist}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white text-gray-500"
          onClick={shareProduct}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Discount badge */}
      {discountPercentage && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
          {discountPercentage}% OFF
        </div>
      )}
    </div>
  );
};

export default ProductDetailImage;

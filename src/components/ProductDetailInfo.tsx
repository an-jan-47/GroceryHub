
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/StarRating';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { formatCouponForDisplay } from '@/services/couponService';
import { useEffect } from 'react';
import { getCouponById } from '@/services/couponService';

interface ProductDetailInfoProps {
  product: {
    id: string;
    name: string;
    price: number;
    sale_price?: number;
    rating: number;
    review_count: number;
    brand: string;
    category: string;
    description: string;
    applicable_coupons?: string[];
  };
  quantity: number;
  onIncrementQuantity: () => void;
  onDecrementQuantity: () => void;
}

const ProductDetailInfo = ({ 
  product, 
  quantity, 
  onIncrementQuantity, 
  onDecrementQuantity 
}: ProductDetailInfoProps) => {
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!product.applicable_coupons?.length) return;
      
      try {
        const couponPromises = product.applicable_coupons.map(id => getCouponById(id));
        const fetchedCoupons = await Promise.all(couponPromises);
        setCoupons(fetchedCoupons.filter(Boolean));
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    fetchCoupons();
  }, [product.applicable_coupons]);

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast('Coupon code copied!', {
      description: 'You can use it at checkout.'
    });
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-start">
        <h1 className="text-xl font-bold">{product.name}</h1>
      </div>
      
      <div className="flex items-center mt-1">
        <div className="flex items-center">
          <StarRating rating={product.rating} size="sm" />
        </div>
        <span className="mx-2 text-gray-300">|</span>
        <span className="text-sm text-gray-600">{product.review_count} reviews</span>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div>
          <span className="text-2xl font-bold text-blue-600">₹{product.sale_price || product.price}</span>
          {product.sale_price && (
            <span className="ml-2 text-base line-through text-gray-500">₹{product.price}</span>
          )}
        </div>
        
        {/* Quantity selector */}
        <div className="flex items-center border rounded-md">
          <button 
            onClick={onDecrementQuantity}
            className="px-3 py-1 text-lg"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-3 py-1">{quantity}</span>
          <button 
            onClick={onIncrementQuantity}
            className="px-3 py-1 text-lg"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Brand and category */}
      <div className="flex flex-wrap gap-2 mt-2">
        <Badge variant="outline" className="text-xs">{product.brand}</Badge>
        <Badge variant="outline" className="text-xs">{product.category}</Badge>
      </div>
      
      {/* Description */}
      <div className="mt-4">
        <h2 className="font-semibold mb-2">Description</h2>
        <p className="text-gray-600 text-sm">{product.description}</p>
      </div>

      {/* Coupons Section */}
      {product.applicable_coupons && product.applicable_coupons.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Extra Savings for You </h2>
          <div className="space-y-2">
            {product.applicable_coupons.map((couponId) => {
              const coupon = coupons.find(c => c.id === couponId);
              if (!coupon) return null;
              
              const formattedCoupon = formatCouponForDisplay(coupon);
              return (
                <div 
                  key={coupon.id} 
                  className="p-3 border rounded-lg bg-blue-50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-blue-600">{formattedCoupon.discountText}</p>
                    <p className="text-sm text-gray-600">{formattedCoupon.conditionsText}</p>
                  </div>
                  <button
                    onClick={() => copyCouponCode(coupon.code)}
                    className="px-3 py-1 text-sm bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    {coupon.code}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailInfo;

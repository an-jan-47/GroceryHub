
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Clock, Gift } from 'lucide-react';
import { getActiveCoupons, type Coupon } from '@/services/couponService';
import { useNavigate } from 'react-router-dom';

interface CouponRecommendationsProps {
  onApplyCoupon: (coupon: Coupon) => void;
  cartTotal: number;
}

const CouponRecommendations = ({ onApplyCoupon, cartTotal }: CouponRecommendationsProps) => {
  const navigate = useNavigate();
  
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupon-recommendations'],
    queryFn: () => getActiveCoupons(3)
  });

  const eligibleCoupons = coupons.filter(coupon => cartTotal >= coupon.min_purchase_amount);

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (eligibleCoupons.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4 border border-green-200">
      <div className="flex items-center mb-3">
        <Gift className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="font-semibold text-green-800">Available Offers</h3>
      </div>
      
      <div className="space-y-2 mb-3">
        {eligibleCoupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <Tag className="w-4 h-4 text-green-600 mr-1" />
                  <span className="font-mono font-bold text-green-700">{coupon.code}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                  </Badge>
                  {coupon.min_purchase_amount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Min ₹{coupon.min_purchase_amount}
                    </Badge>
                  )}
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => onApplyCoupon(coupon)}
                className="ml-2 bg-green-600 hover:bg-green-700"
              >
                Apply
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate('/coupons')}
        className="w-full border-green-300 text-green-700 hover:bg-green-50"
      >
        View All Coupons
      </Button>
    </div>
  );
};

export default CouponRecommendations;

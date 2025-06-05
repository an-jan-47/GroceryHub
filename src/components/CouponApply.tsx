
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { validateCoupon, type Coupon } from '@/services/couponService';

interface CouponApplyProps {
  cartTotal: number;
  onCouponApplied: (couponData: any) => void;
  appliedCoupon?: any;
  onCouponRemoved: () => void;
}

const CouponApply = ({ cartTotal, onCouponApplied, appliedCoupon, onCouponRemoved }: CouponApplyProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    try {
      const coupon = await validateCoupon(couponCode, cartTotal);
      
      // Calculate discount based on coupon type and value
      let discountAmount = 0;
      
      if (coupon.type === 'percentage') {
        // For percentage coupons, calculate percentage of cart total
        discountAmount = (cartTotal * coupon.value) / 100;
        
        // Apply max discount limit if specified
        if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
          discountAmount = coupon.max_discount_amount;
        }
      } else if (coupon.type === 'fixed') {
        // For fixed amount coupons
        discountAmount = Math.min(coupon.value, cartTotal);
      }
      
      const couponInfo = {
        coupon: coupon,
        discountAmount: discountAmount
      };
      
      onCouponApplied(couponInfo);
      setCouponCode('');
      toast(`Coupon applied! You saved ₹${discountAmount.toFixed(2)}`);
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      toast(error.message || 'Invalid coupon code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    toast('Coupon removed');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold mb-3">Apply Coupon</h3>
      
      {appliedCoupon ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                {appliedCoupon.coupon.code}
              </Badge>
              <p className="text-sm text-green-700 mt-1">
                {appliedCoupon.coupon.description}
              </p>
              <p className="text-sm font-medium text-green-800">
                You saved ₹{appliedCoupon.discountAmount?.toFixed(2)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveCoupon}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <Button 
            onClick={handleApplyCoupon}
            disabled={isValidating}
            className="bg-brand-blue hover:bg-brand-darkBlue"
          >
            {isValidating ? 'Validating...' : 'Apply'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CouponApply;

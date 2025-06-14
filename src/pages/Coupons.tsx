
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Tag, Copy } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { calculateDiscount, type Coupon } from '@/services/couponService';
import { useCouponState } from '@/components/CouponStateManager';
import { useCart } from '@/hooks/useCart';

const Coupons = () => {
  const navigate = useNavigate();
  const { addCoupon } = useCouponState();
  const { cartItems } = useCart();

  // Fetch all active coupons
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['all-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .gte('expiry_date', new Date().toISOString())
        .order('value', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleApplyCoupon = (couponCode: string) => {
    if (!cartItems || cartItems.length === 0) {
      toast('Your cart is empty!', {
        description: 'Add items to your cart before applying a coupon.'
      });
      return;
    }

    const couponData = coupons.find(c => c.code === couponCode);
    if (couponData) {
      // Type assertion to ensure compatibility
      const typedCoupon: Coupon = {
        ...couponData,
        type: couponData.type as 'percentage' | 'fixed'
      };
      
      const cartTotal = cartItems.reduce((total, item) => {
        const itemPrice = item.salePrice || item.price;
        return total + (itemPrice * item.quantity);
      }, 0);
      
      const discountAmount = calculateDiscount(typedCoupon, cartTotal);
      
      addCoupon(typedCoupon, discountAmount);
      
      toast('Coupon applied! Redirecting to cart...', {
        description: `₹${discountAmount.toFixed(2)} discount will be applied at checkout.`
      });
      
      navigate('/cart');
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast('Coupon code copied!', {
      description: 'You can paste it at checkout.'
    });
  };

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="py-3 flex items-center">
          <Link to="/cart" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Cart</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Coupons & Offers</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {coupons.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Tag className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No coupons available</h3>
                <p className="text-gray-500">Check back later for exciting offers!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {coupon.code}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCouponCode(coupon.code)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mb-3">
                      <h3 className="font-medium mb-1">
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {coupon.description || `Get ${coupon.type === 'percentage' ? coupon.value + '%' : '₹' + coupon.value} off`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Min. purchase: ₹{coupon.min_purchase_amount}
                        {coupon.max_discount_amount && ` • Max discount: ₹${coupon.max_discount_amount}`}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => handleApplyCoupon(coupon.code)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Apply Coupon
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Coupons;

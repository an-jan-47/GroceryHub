
import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Tag, Copy } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { validateCoupon, calculateDiscount, type Coupon } from '@/services/couponService';
import { useCouponState } from '@/components/CouponStateManager';
import { useCart } from '@/hooks/useCart';

const CouponApply = () => {
  const navigate = useNavigate();
  const { addCoupon, appliedCoupons } = useCouponState();
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

  // Fetch cart items with their applicable coupons
  const { data: cartItemsWithCoupons = [] } = useQuery({
    queryKey: ['cart-items-coupons', cartItems.map(item => item.id)],
    queryFn: async () => {
      if (cartItems.length === 0) return [];
      
      const productIds = cartItems.map(item => item.id);
      const { data, error } = await supabase
        .from('products')
        .select('id, applicable_coupons')
        .in('id', productIds);
      
      if (error) throw error;
      
      return cartItems.map(item => {
        const productData = data.find(p => p.id === item.id);
        return {
          ...item,
          applicable_coupons: productData?.applicable_coupons || []
        };
      });
    },
    enabled: cartItems.length > 0,
  });

  const handleApplyCoupon = async (code: string) => {
    try {
      // Calculate cart total
      const cartTotal = cartItemsWithCoupons.reduce((total, item) => {
        const itemPrice = item.salePrice || item.price;
        return total + (itemPrice * item.quantity);
      }, 0);
      
      // Convert AppliedCouponState to AppliedCoupon format for validation
      const appliedCouponsForValidation = appliedCoupons.map(c => ({
        ...c,
        appliedToTotal: c.appliedToTotal || cartTotal
      }));
      
      const coupon = await validateCoupon(code, cartTotal, appliedCouponsForValidation, cartItemsWithCoupons);
      const { discountAmount, applicableProducts } = calculateDiscount(coupon, cartTotal, cartItemsWithCoupons);
      
      addCoupon(coupon, discountAmount, applicableProducts);
      
      toast("Coupon applied successfully!", {
        description: `₹${discountAmount.toFixed(2)} discount applied to eligible products`
      });
      
      // Navigate back to cart
      navigate('/cart');
    } catch (error) {
      console.error('Coupon application error:', error);
      toast("Unable to apply coupon", {
        description: error.message
      });
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast('Coupon code copied!', {
      description: 'You can paste it in the cart.'
    });
  };

  const isApplied = (couponId: string) => {
    return appliedCoupons.some(c => c.coupon.id === couponId);
  };

  const canApplyCoupon = (coupon: any) => {
    // Check if any cart item has this coupon in its applicable_coupons
    return cartItemsWithCoupons.some(item => {
      const itemApplicableCoupons = item.applicable_coupons || [];
      return itemApplicableCoupons.includes(coupon.code);
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
                {coupons.map((coupon) => {
                  const applied = isApplied(coupon.id);
                  const eligible = canApplyCoupon(coupon);
                  
                  return (
                    <div key={coupon.id} className={`bg-white rounded-lg shadow-sm border p-4 ${applied ? 'bg-green-50 border-green-200' : eligible ? '' : 'opacity-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`${applied ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {coupon.code}
                          </Badge>
                          {applied && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              Applied
                            </Badge>
                          )}
                          {!eligible && !applied && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-300">
                              Not Eligible
                            </Badge>
                          )}
                        </div>
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
                        {!eligible && !applied && (
                          <p className="text-xs text-red-500 mt-1">
                            No eligible products in cart
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => handleApplyCoupon(coupon.code)}
                        disabled={applied || !eligible}
                        className={`w-full ${applied ? 'bg-green-600 hover:bg-green-700' : eligible ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
                      >
                        {applied ? 'Applied to Cart' : eligible ? 'Apply Coupon' : 'Not Eligible'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default CouponApply;


import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Tag } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import CouponApply from '@/components/CouponApply';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const Coupons = () => {
  const navigate = useNavigate();

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
    // Store applied coupon in localStorage for cart page
    const couponData = coupons.find(c => c.code === couponCode);
    if (couponData) {
      localStorage.setItem('appliedCoupon', JSON.stringify({
        coupon: couponData,
        discountAmount: couponData.value // This will be properly calculated in cart
      }));
      
      toast('Coupon saved! Redirecting to cart...', {
        description: 'Your coupon will be applied at checkout.'
      });
      
      // Redirect to cart after a short delay
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    }
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
                  <CouponApply
                    key={coupon.id}
                    couponCode={coupon.code}
                    description={coupon.description || `Get ${coupon.type === 'percentage' ? coupon.value + '%' : '₹' + coupon.value} off`}
                    onApply={handleApplyCoupon}
                  />
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

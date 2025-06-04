
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Tag } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import CouponApply from '@/components/CouponApply';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const Coupons = () => {
  const [appliedCoupons, setAppliedCoupons] = useState<string[]>([]);

  // Fetch active coupons, showing only top 2 in available offers
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'],
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
        discountAmount: couponData.value // This should be calculated based on cart total
      }));
      
      setAppliedCoupons(prev => [...prev, couponCode]);
      toast('Coupon saved! It will be applied at checkout.');
    }
  };

  // Show top 2 coupons in available offers
  const availableOffers = coupons.slice(0, 2);
  const allCoupons = coupons;

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="py-3 flex items-center">
          <Link to="/profile" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Profile</span>
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
            {/* Available Offers - Top 2 */}
            {availableOffers.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-green-600" />
                  Available Offers
                </h2>
                <div className="space-y-3">
                  {availableOffers.map((coupon) => (
                    <CouponApply
                      key={coupon.id}
                      couponCode={coupon.code}
                      description={coupon.description || `Get ${coupon.type === 'percentage' ? coupon.value + '%' : '₹' + coupon.value} off`}
                      onApply={handleApplyCoupon}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* All Coupons */}
            <div>
              <h2 className="text-lg font-semibold mb-4">All Coupons</h2>
              {allCoupons.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Tag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No coupons available</h3>
                  <p className="text-gray-500">Check back later for exciting offers!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allCoupons.map((coupon) => (
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
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Coupons;

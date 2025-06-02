
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Tag, Clock, Gift, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { getActiveCoupons, type Coupon } from '@/services/couponService';

const CouponsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['all-coupons'],
    queryFn: () => getActiveCoupons()
  });

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast('Coupon code copied!', {
      description: `${code} copied to clipboard`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-500"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </button>
        </div>
        
        <div className="flex items-center mb-6">
          <Gift className="w-6 h-6 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold">Available Coupons</h1>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-32"></div>
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">No coupons found</h2>
            <p className="text-gray-500">
              {searchTerm ? 'Try searching with different keywords' : 'Check back later for new offers!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCoupons.map((coupon) => (
              <div key={coupon.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        <Tag className="w-5 h-5 mr-2" />
                        <span className="font-mono font-bold text-lg">{coupon.code}</span>
                      </div>
                      <p className="text-green-100 text-sm">
                        {coupon.type === 'percentage' 
                          ? `Get ${coupon.value}% off` 
                          : `Get ₹${coupon.value} off`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyCouponCode(coupon.code)}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-gray-700 mb-3">{coupon.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {coupon.min_purchase_amount > 0 && (
                      <Badge variant="outline">
                        Min purchase: ₹{coupon.min_purchase_amount}
                      </Badge>
                    )}
                    {coupon.max_discount_amount && (
                      <Badge variant="outline">
                        Max discount: ₹{coupon.max_discount_amount}
                      </Badge>
                    )}
                    {coupon.usage_limit > 0 && (
                      <Badge variant="outline">
                        {coupon.usage_limit - coupon.usage_count} uses left
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Valid till {formatDate(coupon.expiry_date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default CouponsPage;


import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from '@/components/ui/sonner';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import CouponRecommendations from '@/components/CouponRecommendations';
import { validateCoupon, calculateDiscount, type Coupon } from '@/services/couponService';

const CartPage = () => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal
  } = useCart();
  const navigate = useNavigate();
  const {
    checkAuthForCheckout
  } = useAuthCheck();

  // Calculate costs with corrected tax logic
  const platformFees = 5.00;
  const taxRate = 0.18; // 18% GST
  
  // Subtotal is the cart total without any additional charges
  const subtotal = cartTotal;
  
  // Tax is calculated on subtotal + platform fees (before discount)
  const taxableAmount = subtotal + platformFees;
  const tax = taxableAmount * taxRate;
  
  // Final total calculation
  const totalBeforeDiscount = subtotal + platformFees + tax;
  const finalTotal = totalBeforeDiscount - discountAmount;

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      toast("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const coupon = await validateCoupon(couponCode, subtotal);
      const discount = calculateDiscount(coupon, subtotal);
      
      setAppliedCoupon(coupon);
      setDiscountAmount(discount);
      setCouponCode('');
      
      toast("Coupon applied!", {
        description: `₹${discount.toFixed(2)} discount applied`
      });
    } catch (error: any) {
      toast("Invalid coupon", {
        description: error.message
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    toast("Coupon removed");
  };

  const handleCouponRecommendation = (coupon: Coupon) => {
    const discount = calculateDiscount(coupon, subtotal);
    setAppliedCoupon(coupon);
    setDiscountAmount(discount);
    
    toast("Coupon applied!", {
      description: `₹${discount.toFixed(2)} discount applied`
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast("Cart is empty", {
        description: "Add items to your cart before proceeding to checkout."
      });
      return;
    }

    // Check if user is authenticated before proceeding
    if (checkAuthForCheckout()) {
      // Store applied coupon data for checkout
      if (appliedCoupon) {
        localStorage.setItem('appliedCoupon', JSON.stringify({
          coupon: appliedCoupon,
          discountAmount: discountAmount
        }));
      } else {
        localStorage.removeItem('appliedCoupon');
      }
      
      navigate('/address');
    }
  };

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="py-3 flex items-center">
          <Link to="/" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Continue Shopping</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">My Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Button onClick={() => navigate('/')} className="bg-brand-blue hover:bg-brand-darkBlue">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {cartItems.map(item => (
                <div key={item.id} className="py-4 flex items-center">
                  <Link to={`/product/${item.id}`} className="flex-shrink-0 w-20 h-20">
                    <img 
                      src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.svg'} 
                      alt={item.name} 
                      className="w-full h-full object-cover rounded-md" 
                    />
                  </Link>
                  <div className="ml-4 flex-grow">
                    <Link to={`/product/${item.id}`} className="font-medium text-gray-800 hover:text-brand-blue">
                      {item.name}
                    </Link>
                    <div className="mt-1">
                      {item.salePrice ? (
                        <div className="flex items-center">
                          <span className="font-bold text-brand-blue">₹{item.salePrice.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 line-through ml-1">₹{item.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold">₹{item.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border rounded-md">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                          className="p-1 text-gray-600 hover:text-brand-blue"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-0.5 text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          className="p-1 text-gray-600 hover:text-brand-blue"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              {/* Coupon Recommendations */}
              <CouponRecommendations 
                onApplyCoupon={handleCouponRecommendation}
                cartTotal={subtotal}
              />
              
              {/* Applied Coupon Display */}
              {appliedCoupon && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-blue-800">Coupon Applied: {appliedCoupon.code}</span>
                      <p className="text-sm text-blue-600">You saved ₹{discountAmount.toFixed(2)}</p>
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
              )}
              
              {/* Manual Coupon Entry */}
              <div className="flex items-center space-x-2 mb-6">
                <Input 
                  placeholder="Enter coupon code" 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-grow" 
                />
                <Button 
                  onClick={handleCouponApply} 
                  disabled={!couponCode || isApplyingCoupon}
                  variant="outline"
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply'}
                </Button>
              </div>
              
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fees</span>
                  <span>₹{platformFees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                onClick={handleCheckout} 
                className="w-full mt-4 bg-brand-blue hover:bg-brand-darkBlue"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default CartPage;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import OptimizedCheckoutButton from '@/components/OptimizedCheckoutButton';
import { toast } from '@/components/ui/sonner';
import { validateCoupon, calculateDiscount } from '@/services/couponService';
import { useCouponState } from '@/components/CouponStateManager';

const CartPage = () => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    setCartItems
  } = useCart();
  const { appliedCoupons, addCoupon, removeCoupon, clearCoupons, checkCartAndClearCoupons } = useCouponState();
  const navigate = useNavigate();

  // Check if cart is empty and clear coupons accordingly
  useEffect(() => {
    checkCartAndClearCoupons(cartItems.length);
  }, [cartItems.length, checkCartAndClearCoupons]);

  // Pricing configuration 
  const platformFees = 5.00;
  const deliveryFees = 0.00;
  
  // Calculate item-wise pricing without tax
  const itemCalculations = cartItems.map(item => {
    const itemPrice = item.salePrice !== undefined ? Number(item.salePrice) : Number(item.price);
    const itemTotal = itemPrice * Number(item.quantity);
    
    return {
      ...item,
      itemPrice,
      itemTotal
    };
  });
  
  // Calculate totals without tax
  const subtotal = itemCalculations.reduce((total, item) => total + Number(item.itemTotal), 0);
  const totalBeforeDiscount = subtotal + platformFees + deliveryFees;
  
  // Calculate total discount from all applied coupons
  const totalDiscountAmount = appliedCoupons.reduce((total, { discountAmount }) => total + discountAmount, 0);
  const totalAfterDiscount = Math.max(0, totalBeforeDiscount - totalDiscountAmount);
  
  // Final total without transaction fee
  const finalTotal = totalAfterDiscount;
  
  // Fixed clearCart function
  const clearCart = () => {
    setCartItems([]);
    clearCoupons(); // Clear all applied coupons
    // Don't show toast notification when clearing cart programmatically
    // toast("Cart cleared");
  };
  
  // Add coupon clearing when removing last item
  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
    // Check if this was the last item and clear coupons if needed
    if (cartItems.length === 1) {
      clearCoupons();
    }
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      toast("Please enter a coupon code");
      return;
    }

    // Check if coupon is already applied
    const isAlreadyApplied = appliedCoupons.some(c => c.coupon.code === couponCode.toUpperCase());
    if (isAlreadyApplied) {
      toast("Coupon already applied");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      // Convert AppliedCouponState to AppliedCoupon format for validation
      const appliedCouponsForValidation = appliedCoupons.map(c => ({
        ...c,
        appliedToTotal: c.appliedToTotal || totalBeforeDiscount
      }));
      
      const coupon = await validateCoupon(couponCode, totalBeforeDiscount, appliedCouponsForValidation);
      const discount = calculateDiscount(coupon, totalBeforeDiscount);
      
      addCoupon(coupon, discount);
      setCouponCode('');
      
      toast("Coupon applied!", {
        description: `₹${discount.toFixed(2)} discount applied`
      });
    } catch (error) {
      toast("Invalid coupon", {
        description: error.message
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = (couponId) => {
    console.log('Removing coupon with ID:', couponId);
    removeCoupon(couponId);
    
    // Force a re-render to update the UI
    setTimeout(() => {
      // This will trigger a re-render
      setIsApplyingCoupon(false);
    }, 50);
    
    toast('Coupon removed');
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
            <div key={cartItems.length} className="divide-y">
              {cartItems.map((item) => {
                const itemPrice = item.salePrice !== undefined ? Number(item.salePrice) : Number(item.price);
                const totalItemPrice = itemPrice * item.quantity;
                
                return (
                  <div key={item.id} className="flex py-4 border-b">
                    <Link to={`/product/${item.id}`} className="flex-shrink-0 w-20 h-20">
                      <img 
                        src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.svg'} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-md" 
                      />
                    </Link>
                    <div className="ml-4 flex-grow flex flex-col">
                      <Link to={`/product/${item.id}`} className="font-medium text-gray-800 hover:text-brand-blue">
                        {item.name}
                      </Link>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="mx-3 font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col items-end">
                            <span className="text-gray-800 font-semibold">₹{(item.salePrice || item.price).toFixed(2)}</span>
                            {item.salePrice && (
                              <span className="text-gray-500 line-through text-sm">₹{item.price.toFixed(2)}</span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-0"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6">
              {/* Applied Coupons Display */}
              {appliedCoupons.length > 0 && (
                <div className="space-y-3 mb-4">
                  {appliedCoupons.map(({ coupon, discountAmount }) => (
                    <div key={coupon.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-blue-800">Coupon Applied: {coupon.code}</span>
                          <p className="text-sm text-blue-600">You saved ₹{discountAmount.toFixed(2)}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRemoveCoupon(coupon.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Coupon Entry and Coupons Link */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Enter coupon code" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-grow" 
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCouponApply();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleCouponApply} 
                    disabled={!couponCode || isApplyingCoupon}
                    variant="outline"
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/coupons')}
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  View All Coupons
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
                  <span className="text-gray-600">Delivery Fees</span>
                  <span className="text-green-600">FREE</span>
                </div>
                
                {/* Individual coupon discounts */}
                {appliedCoupons.map((applied) => (
                  <div key={applied.coupon.id} className="flex justify-between text-green-600">
                    <span className="text-sm">{applied.coupon.code} Discount</span>
                    <span className="text-sm">-₹{applied.discountAmount.toFixed(2)}</span>
                  </div>
                ))}
                
                {/* Total discount summary */}
                {totalDiscountAmount > 0 && (
                  <div className="flex justify-between font-medium text-green-600 border-t border-green-200 pt-2">
                    <span>Total Coupon Savings</span>
                    <span>-₹{totalDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
                {totalDiscountAmount > 0 && (
                  <div className="text-sm text-green-600 text-center">
                    You saved ₹{totalDiscountAmount.toFixed(2)} on this order!
                  </div>
                )}
                {finalTotal < 2000 && (
                  <div className="text-sm text-red-600 text-center mt-2">
                    Minimum order amount is ₹2000. Please add more items to proceed.
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                {finalTotal >= 2000 ? (
                  <OptimizedCheckoutButton cartItems={cartItems} />
                ) : (
                  <Button disabled className="w-full py-6 text-lg bg-gray-400">
                    Checkout (Minimum ₹2000)
                  </Button>
                )}
                
                {/* Clear Cart Button removed */}
              </div>
            </div>
          </>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default CartPage;

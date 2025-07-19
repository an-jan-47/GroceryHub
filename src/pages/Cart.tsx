
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import OptimizedCheckoutButton from '@/components/OptimizedCheckoutButton';
import { toast } from 'sonner';
import { validateCoupon, calculateDiscount, getItemDiscount, type AppliedCoupon } from '@/services/couponService';
import { useCouponState, type AppliedCouponState } from '@/components/CouponStateManager';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  // Fetch cart items with their applicable coupons
  const { data: cartItemsWithCoupons = [] } = useQuery({
    queryKey: ['cart-items-coupons', cartItems.map((item: any) => item.id)],
    queryFn: async () => {
      if (cartItems.length === 0) return [];
      
      const productIds = cartItems.map((item: any) => item.id);
      const { data, error } = await supabase
        .from('products')
        .select('id, applicable_coupons')
        .in('id', productIds);
      
      if (error) throw error;
      
      return cartItems.map((item: any) => {
        const productData = data?.find((p: any) => p.id === item.id);
        return {
          ...item,
          applicable_coupons: productData?.applicable_coupons || []
        };
      });
    },
    enabled: cartItems.length > 0,
  });

  // Check if cart is empty and clear coupons accordingly
  useEffect(() => {
    checkCartAndClearCoupons(cartItems.length);
  }, [cartItems.length, checkCartAndClearCoupons]);

  // Pricing configuration 
  const platformFees = 5.00;
  const deliveryFees = 0.00;
  
  // Calculate item-wise pricing without tax
  const itemCalculations = cartItemsWithCoupons.map((item: any) => {
    const itemPrice = item.salePrice !== undefined ? Number(item.salePrice) : Number(item.price);
    const itemTotal = itemPrice * Number(item.quantity);
    
    return {
      ...item,
      itemPrice,
      itemTotal
    };
  });
  
  // Calculate totals without tax
  const subtotal = itemCalculations.reduce((total: number, item: any) => total + Number(item.itemTotal), 0);
  const totalBeforeDiscount = subtotal + platformFees + deliveryFees;
  
  // Calculate total discount from all applied coupons
  const totalDiscountAmount = appliedCoupons.reduce((total, applied) => {
    const discount = Number(applied.discountAmount) || 0;
    return total + discount;
  }, 0);
  const totalAfterDiscount = Math.max(0, totalBeforeDiscount - totalDiscountAmount);
  
  // Final total without transaction fee
  const finalTotal = totalAfterDiscount;
  
  // Fixed clearCart function
  const clearCart = () => {
    setCartItems([]);
    clearCoupons(); // Clear all applied coupons
  };
  
  // Add coupon clearing when removing last item
  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(productId);
    // Check if this was the last item and clear coupons if needed
    if (cartItems.length === 1) {
      clearCoupons();
    }
  };

  // Handle direct quantity input
  const handleQuantityInputChange = (itemId: string, value: string) => {
    const newQuantity = parseInt(value) || 1;
    if (newQuantity > 0 && newQuantity <= 999) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    // Check if coupon is already applied
    const isAlreadyApplied = appliedCoupons.some(c => c.coupon.code === couponCode.toUpperCase());
    if (isAlreadyApplied) {
      toast.error("Coupon already applied");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      console.log('Applying coupon:', couponCode);
      console.log('Cart items for validation:', cartItemsWithCoupons);
      
      // Convert AppliedCouponState to AppliedCoupon format for validation
      const appliedCouponsForValidation: AppliedCoupon[] = appliedCoupons.map(c => ({
        ...c,
        appliedToTotal: c.appliedToTotal || totalBeforeDiscount,
        applicableProducts: c.applicableProducts || []
      }));
      
      const coupon = await validateCoupon(couponCode, totalBeforeDiscount, appliedCouponsForValidation, cartItemsWithCoupons);
      const discountResult = calculateDiscount(coupon, totalBeforeDiscount, cartItemsWithCoupons);
      
      // Only add coupon if it has eligible products and provides discount
      if (discountResult.applicableProducts.length > 0 && discountResult.discountAmount > 0) {
        addCoupon(coupon, discountResult.discountAmount, discountResult.applicableProducts);
        setCouponCode('');
        
        toast.success("Coupon applied successfully!", {
          description: `₹${discountResult.discountAmount.toFixed(2)} discount applied to ${discountResult.applicableProducts.length} eligible products`
        });
      } else {
        toast.error("This coupon is not applicable to any products in your cart");
      }
    } catch (error: any) {
      console.error('Coupon application error:', error);
      toast.error("Ineligible coupon", {
        description: error.message
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = (couponId: string) => {
    console.log('Removing coupon with ID:', couponId);
    removeCoupon(couponId);
    setTimeout(() => {
      setIsApplyingCoupon(false);
    }, 50);
    toast.success('Coupon removed');
  };

  // Convert AppliedCouponState to AppliedCoupon for getItemDiscount
  const appliedCouponsForDiscount: AppliedCoupon[] = appliedCoupons.map(c => ({
    ...c,
    appliedToTotal: c.appliedToTotal || totalBeforeDiscount,
    applicableProducts: c.applicableProducts || []
  }));

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
              {cartItemsWithCoupons.map((item: any) => {
                const itemPrice = item.salePrice !== undefined ? Number(item.salePrice) : Number(item.price);
                const totalItemPrice = itemPrice * Number(item.quantity);
                const { totalDiscount, discountPercentage } = getItemDiscount(item, appliedCouponsForDiscount);
                const finalItemPrice = totalItemPrice - totalDiscount;
                
                // Check if item has applicable coupons
                const hasApplicableCoupons = appliedCoupons.some(ac => 
                  ac.applicableProducts?.includes(item.id)
                );
                
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
                      
                      {/* Show coupon applied badge */}
                      {hasApplicableCoupons && (
                        <div className="mt-1">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                            Coupon Applied
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(1, Number(item.quantity) - 1))}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max="999"
                            value={item.quantity}
                            onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                            className="w-16 h-8 text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Number(item.quantity) + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col items-end">
                            {totalDiscount > 0 ? (
                              <>
                                <span className="text-gray-800 font-semibold">₹{finalItemPrice.toFixed(2)}</span>
                                <span className="text-gray-500 line-through text-sm">₹{totalItemPrice.toFixed(2)}</span>
                                <div className="flex items-center space-x-1">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                    -{discountPercentage}% OFF
                                  </Badge>
                                  <span className="text-green-600 text-xs">Save ₹{totalDiscount.toFixed(2)}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="text-gray-800 font-semibold">₹{(item.salePrice || item.price).toFixed(2)}</span>
                                {item.salePrice && (
                                  <span className="text-gray-500 line-through text-sm">₹{item.price.toFixed(2)}</span>
                                )}
                              </>
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
                  {appliedCoupons.map(({ coupon, discountAmount, applicableProducts }) => {
                    const discount = Number(discountAmount) || 0;
                    const eligibleCount = applicableProducts?.length || 0;
                    
                    // Only show coupon if it has eligible products and provides discount
                    if (eligibleCount === 0 || discount === 0) {
                      return null;
                    }
                    
                    return (
                      <div key={coupon.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-green-800">Coupon Applied: {coupon.code}</span>
                            <p className="text-sm text-green-600">
                              You saved ₹{discount.toFixed(2)} on {eligibleCount} eligible products
                            </p>
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
                    );
                  })}
                </div>
              )}
              
              {/* Coupon Entry and Coupons Link */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Enter coupon code" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onPaste={e => {
                      // Get pasted text and set it directly
                      const pastedText = e.clipboardData.getData('text');
                      if (pastedText) {
                        setCouponCode(pastedText.trim().toUpperCase());
                        // Prevent default to avoid double paste
                        e.preventDefault();
                      }
                    }}
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
                
                {/* Individual coupon discounts - only show if discount > 0 */}
                {appliedCoupons.map((applied) => {
                  const discount = Number(applied.discountAmount) || 0;
                  if (discount === 0) return null;
                  
                  return (
                    <div key={applied.coupon.id} className="flex justify-between text-green-600">
                      <span className="text-sm">{applied.coupon.code} Discount</span>
                      <span className="text-sm">-₹{discount.toFixed(2)}</span>
                    </div>
                  );
                })}
                
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

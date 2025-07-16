import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingCart, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import OptimizedCheckoutButton from '@/components/OptimizedCheckoutButton';
import { toast } from '@/components/ui/sonner';
import { validateProductSpecificCoupon } from '@/services/enhancedCouponService';
import { useCouponState } from '@/components/CouponStateManager';
import { supabase } from '@/integrations/supabase/client';
import type { Coupon } from '@/types/coupon';

const CartPage = () => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    setCartItems,
    updateItemDiscount,
    clearItemDiscounts
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
  
  // Calculate item-wise pricing with applied discounts
  const itemCalculations = cartItems.map(item => {
    const itemPrice = item.salePrice !== undefined ? Number(item.salePrice) : Number(item.price);
    const discountedPrice = itemPrice - (item.appliedDiscountAmount || 0);
    const itemTotal = discountedPrice * Number(item.quantity);
    
    return {
      ...item,
      itemPrice,
      discountedPrice,
      itemTotal,
      originalTotal: itemPrice * Number(item.quantity)
    };
  });
  
  // Calculate totals
  const subtotal = itemCalculations.reduce((total, item) => total + Number(item.itemTotal), 0);
  const totalBeforeDiscount = subtotal + platformFees + deliveryFees;
  
  // Calculate total discount from all applied coupons
  const totalDiscountAmount = appliedCoupons.reduce((total, { discountAmount }) => total + discountAmount, 0);
  const totalAfterDiscount = Math.max(0, totalBeforeDiscount - totalDiscountAmount);
  
  // Final total
  const finalTotal = totalAfterDiscount;
  
  // Clear cart function
  const clearCart = () => {
    setCartItems([]);
    clearCoupons();
    clearItemDiscounts();
  };
  
  // Add coupon clearing when removing last item
  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(productId);
    if (cartItems.length === 1) {
      clearCoupons();
      clearItemDiscounts();
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
      toast("Please enter a coupon code");
      return;
    }

    const isAlreadyApplied = appliedCoupons.some((c: any) => c.coupon.code === couponCode.toUpperCase());
    if (isAlreadyApplied) {
      toast("Coupon already applied");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      // Fetch coupon from database
      const { data: couponData, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .gte('expiry_date', new Date().toISOString())
        .single();

      if (error || !couponData) {
        throw new Error('Invalid coupon code');
      }

      // Validate coupon with product-specific logic
      const validationResult = await validateProductSpecificCoupon(couponData as Coupon, cartItems);
      
      if (!validationResult.isValid) {
        toast("Cannot apply coupon", {
          description: validationResult.reason
        });
        return;
      }

      // Apply discounts to individual products
      validationResult.eligibleProducts.forEach(productValidation => {
        if (productValidation.isEligible) {
          const item = cartItems.find(item => item.id === productValidation.productId);
          if (item) {
            const itemPrice = item.salePrice || item.price;
            const discountPercentage = (productValidation.discountAmount / (itemPrice * item.quantity)) * 100;
            updateItemDiscount(
              productValidation.productId, 
              discountPercentage, 
              productValidation.discountAmount / item.quantity
            );
          }
        }
      });
      
      addCoupon(couponData as Coupon, validationResult.totalDiscountAmount);
      setCouponCode('');
      
      toast("Coupon applied!", {
        description: `₹${validationResult.totalDiscountAmount.toFixed(2)} discount applied to eligible products`
      });
    } catch (error: any) {
      toast("Invalid coupon", {
        description: error.message
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = (couponId: string) => {
    console.log('Removing coupon with ID:', couponId);
    removeCoupon(couponId);
    clearItemDiscounts();
    setTimeout(() => {
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
                const hasDiscount = (item.appliedDiscountPercentage || 0) > 0;
                const discountedPrice = itemPrice - (item.appliedDiscountAmount || 0);
                
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
                      
                      {hasDiscount && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            {item.appliedDiscountPercentage?.toFixed(1)}% OFF
                          </div>
                        </div>
                      )}
                      
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
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col items-end">
                            {hasDiscount ? (
                              <>
                                <span className="text-gray-800 font-semibold">₹{discountedPrice.toFixed(2)}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500 line-through text-sm">₹{itemPrice.toFixed(2)}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="text-gray-800 font-semibold">₹{itemPrice.toFixed(2)}</span>
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
              {appliedCoupons.length > 0 && (
                <div className="space-y-3 mb-4">
                  {appliedCoupons.map(({ coupon, discountAmount }) => (
                    <div key={coupon.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-blue-800">Coupon Applied: {coupon.code}</span>
                          <p className="text-sm text-blue-600">You saved ₹{discountAmount.toFixed(2)} on eligible products</p>
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
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Enter coupon code" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onPaste={e => {
                      const pastedText = e.clipboardData.getData('text');
                      if (pastedText) {
                        setCouponCode(pastedText.trim().toUpperCase());
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
                
                {appliedCoupons.map((applied) => (
                  <div key={applied.coupon.id} className="flex justify-between text-green-600">
                    <span className="text-sm">{applied.coupon.code} Discount</span>
                    <span className="text-sm">-₹{applied.discountAmount.toFixed(2)}</span>
                  </div>
                ))}
                
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

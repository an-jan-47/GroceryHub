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
  const [optimisticQuantities, setOptimisticQuantities] = useState<Record<string, number>>({});
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    setCartItems
  } = useCart();
  const { appliedCoupons, addCoupon, removeCoupon, clearCoupons, checkCartAndClearCoupons } = useCouponState();
  const navigate = useNavigate();

  const { data: cartItemsWithCoupons = [] } = useQuery({
    queryKey: ['cart-items-coupons', cartItems.map((item: any) => item.id)],
    queryFn: async () => {
      if (cartItems.length === 0) return [];
      
      const productIds = cartItems.map((item: any) => item.id);
      const { data, error } = await supabase
        .from('products')
        .select('id, applicable_coupons, stock')
        .in('id', productIds);
      
      if (error) throw error;
      
      return cartItems.map((item: any) => {
        const productData = data?.find((p: any) => p.id === item.id);
        return {
          ...item,
          applicable_coupons: productData?.applicable_coupons || [],
          currentStock: productData?.stock || 0,
          quantity: optimisticQuantities[item.id] ?? item.quantity
        };
      });
    },
    enabled: cartItems.length > 0,
  });

  useEffect(() => {
    checkCartAndClearCoupons(cartItems.length);
  }, [cartItems.length, checkCartAndClearCoupons]);

  useEffect(() => {
    const currentIds = new Set(cartItems.map(item => item.id));
    setOptimisticQuantities(prev => {
      const filtered = Object.fromEntries(
        Object.entries(prev).filter(([id]) => currentIds.has(id))
      );
      return filtered;
    });
  }, [cartItems.map(item => item.id).join(',')]);

  const platformFees = 5.00;
  
  const itemCalculations = cartItemsWithCoupons.map((item: any) => {
    const itemPrice = item.salePrice !== undefined ? Number(item.salePrice) : Number(item.price);
    const currentQuantity = optimisticQuantities[item.id] ?? Number(item.quantity);
    const itemTotal = itemPrice * currentQuantity;
    
    return {
      ...item,
      itemPrice,
      itemTotal,
      quantity: currentQuantity
    };
  });
  
  const subtotal = itemCalculations.reduce((total: number, item: any) => total + Number(item.itemTotal), 0);
  
  const deliveryFees = subtotal >= 2000 ? 0.00 : 50.00;
  
  const totalBeforeDiscount = subtotal + platformFees + deliveryFees;
  
  const totalDiscountAmount = appliedCoupons.reduce((total, applied) => {
    const discount = Number(applied.discountAmount) || 0;
    return total + discount;
  }, 0);
  const totalAfterDiscount = Math.max(0, totalBeforeDiscount - totalDiscountAmount);
  
  const finalTotal = totalAfterDiscount;
  
  const clearCart = () => {
    setCartItems([]);
    clearCoupons();
    setOptimisticQuantities({});
  };
  
  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(productId);
    setOptimisticQuantities(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
    if (cartItems.length === 1) {
      clearCoupons();
    }
  };

  const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    const item = cartItemsWithCoupons.find((item: any) => item.id === itemId);
    if (!item) return;

    if (newQuantity > item.currentStock) {
      toast.error(`Only ${item.currentStock} items available in stock`);
      setOptimisticQuantities(prev => ({
        ...prev,
        [itemId]: item.currentStock
      }));
      updateQuantity(itemId, item.currentStock);
      return;
    }

    setOptimisticQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
    
    updateQuantity(itemId, newQuantity);
  };

  const handleQuantityInputChange = (itemId: string, value: string) => {
    const newQuantity = parseInt(value) || 1;
    if (newQuantity > 0 && newQuantity <= 999) {
      setOptimisticQuantities(prev => ({
        ...prev,
        [itemId]: newQuantity
      }));
      
      setTimeout(() => {
        handleQuantityUpdate(itemId, newQuantity);
      }, 300);
    }
  };

  const handleInputBlur = (itemId: string) => {
    setOptimisticQuantities(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const isAlreadyApplied = appliedCoupons.some(c => c.coupon.code === couponCode.toUpperCase());
    if (isAlreadyApplied) {
      toast.error("This coupon has already been applied");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const appliedCouponsForValidation: AppliedCoupon[] = appliedCoupons.map(c => ({
        ...c,
        appliedToTotal: c.appliedToTotal || totalBeforeDiscount,
        applicableProducts: c.applicableProducts || []
      }));
      
      const coupon = await validateCoupon(couponCode, totalBeforeDiscount, appliedCouponsForValidation, cartItemsWithCoupons);
      
      const eligibleProductsTotal = cartItemsWithCoupons
        .filter(item => coupon.applicable_products?.includes(item.id))
        .reduce((total, item) => {
          const itemPrice = Number(item.salePrice || item.price);
          const quantity = Number(item.quantity);
          return total + (itemPrice * quantity);
        }, 0);

      if (eligibleProductsTotal < coupon.min_purchase_amount) {
        throw new Error(`Minimum purchase amount of ₹${coupon.min_purchase_amount} required for eligible products. Current eligible products total: ₹${eligibleProductsTotal.toFixed(2)}`);
      }

      const discountResult = calculateDiscount(coupon, totalBeforeDiscount, cartItemsWithCoupons);

      if (discountResult.applicableProducts.length === 0) {
        throw new Error("This coupon is not applicable to any products in your cart");
      }

      if (discountResult.discountAmount <= 0) {
        throw new Error("This coupon cannot be applied to your current cart");
      }

      addCoupon(coupon, discountResult.discountAmount, discountResult.applicableProducts);
      setCouponCode('');
      
      toast.success("Coupon applied successfully!", {
        description: `₹${discountResult.discountAmount.toFixed(2)} discount applied to ${discountResult.applicableProducts.length} eligible products`
      });

    } catch (error: any) {
      console.error('Coupon application error:', error);
      toast.error("Coupon validation failed", {
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
                const currentQuantity = optimisticQuantities[item.id] ?? Number(item.quantity);
                const totalItemPrice = itemPrice * currentQuantity;
                const { totalDiscount, discountPercentage } = getItemDiscount({ ...item, quantity: currentQuantity }, appliedCouponsForDiscount);
                const finalItemPrice = totalItemPrice - totalDiscount;
                
                const hasApplicableCoupons = appliedCoupons.some(ac => 
                  ac.applicableProducts?.includes(item.id)
                );
                
                return (
                  <div key={item.id} className="flex py-4 border-b gap-3">
                    <Link to={`/product/${item.id}`} className="flex-shrink-0">
                      <img 
                        src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.svg'} 
                        alt={item.name} 
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md" 
                      />
                    </Link>
                    
                    <div className="flex-grow flex flex-col min-w-0">
                      <Link to={`/product/${item.id}`} className="font-medium text-gray-800 hover:text-brand-blue text-sm sm:text-base truncate">
                        {item.name}
                      </Link>
                      
                      {hasApplicableCoupons && (
                        <div className="mt-1">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                            Coupon Applied
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityUpdate(item.id, Math.max(1, currentQuantity - 1))}
                              className="h-7 w-7 p-0 text-xs"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.currentStock}
                              value={currentQuantity}
                              onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                              onBlur={() => handleInputBlur(item.id)}
                              className="w-12 h-7 text-center text-sm p-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityUpdate(item.id, currentQuantity + 1)}
                              className="h-7 w-7 p-0 text-xs"
                              disabled={currentQuantity >= item.currentStock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1 h-7 w-7"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {item.currentStock <= 5 && (
                          <span className="text-xs text-orange-600">Only {item.currentStock} left in stock</span>
                        )}
                        
                        <div className="flex flex-col">
                          {totalDiscount > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-800 font-semibold text-sm">₹{finalItemPrice.toFixed(2)}</span>
                                <span className="text-gray-500 line-through text-xs">₹{totalItemPrice.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                  -{discountPercentage}% OFF
                                </Badge>
                                <span className="text-green-600 text-xs font-medium">Save ₹{totalDiscount.toFixed(2)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-800 font-semibold text-sm">₹{totalItemPrice.toFixed(2)}</span>
                              {item.salePrice && (
                                <span className="text-gray-500 line-through text-xs">₹{(item.price * currentQuantity).toFixed(2)}</span>
                              )}
                            </div>
                          )}
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
                  {appliedCoupons.map(({ coupon, discountAmount, applicableProducts }) => {
                    const discount = Number(discountAmount) || 0;
                    const eligibleCount = applicableProducts?.length || 0;
                    
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
                  <span className={deliveryFees === 0 ? "text-green-600" : ""}>
                    {deliveryFees === 0 ? 'FREE' : `₹${deliveryFees.toFixed(2)}`}
                  </span>
                </div>
                {subtotal < 2000 && (
                  <div className="text-xs text-orange-600">
                    Add ₹{(2000 - subtotal).toFixed(2)} more for free delivery
                  </div>
                )}
                
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
              </div>
              
              <div className="mt-4">
                <OptimizedCheckoutButton cartItems={cartItems} />
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

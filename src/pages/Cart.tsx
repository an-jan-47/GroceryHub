
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { useCoupon } from '@/components/CouponStateManager';

const Cart: React.FC = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const { appliedCoupons, removeCoupon } = useCoupon();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    const initialQuantities: { [productId: string]: number } = {};
    cartItems.forEach(item => {
      initialQuantities[item.id] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [cartItems]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: quantity
    }));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    toast('Item removed from cart');
  };

  const calculateItemTotal = (item: any) => {
    const price = item.sale_price || item.price;
    return price * item.quantity;
  };

  const calculateDiscountedTotal = () => {
    if (appliedCoupons.length > 0) {
      const totalDiscount = appliedCoupons.reduce((sum, coupon) => sum + coupon.discount_amount, 0);
      return cartTotal - totalDiscount;
    }
    return cartTotal;
  };

  const handleApplyCoupon = async () => {
    setIsApplyingCoupon(true);
    try {
      // This would typically call a service to apply the coupon
      toast('Coupon applied successfully');
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast('Error applying coupon', {
        description: 'Invalid coupon code'
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCouponRemove = async (couponId: string) => {
    try {
      removeCoupon(couponId);
      toast('Coupon removed');
    } catch (error) {
      console.error('Error removing coupon:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove coupon';
      toast('Error removing coupon', {
        description: errorMessage
      });
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b py-4">
                <div className="flex items-center">
                  <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded mr-4" />
                  <div>
                    <Link to={`/product/${item.id}`} className="font-semibold">{item.name}</Link>
                    <p className="text-gray-500 text-sm">
                      {item.sale_price ? (
                        <>
                          <span className="line-through mr-2">₹{item.price.toFixed(2)}</span>
                          ₹{item.sale_price.toFixed(2)}
                        </>
                      ) : (
                        `₹${item.price.toFixed(2)}`
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center border rounded">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newQuantity = Math.max(1, quantities[item.id] - 1);
                        handleQuantityChange(item.id, newQuantity);
                        handleUpdateQuantity(item.id, newQuantity);
                      }}
                      className="px-2"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={quantities[item.id]}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        handleQuantityChange(item.id, newQuantity);
                        handleUpdateQuantity(item.id, newQuantity);
                      }}
                      className="w-16 text-center"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newQuantity = quantities[item.id] + 1;
                        handleQuantityChange(item.id, newQuantity);
                        handleUpdateQuantity(item.id, newQuantity);
                      }}
                      className="px-2"
                    >
                      +
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)} className="ml-4">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              {appliedCoupons.length > 0 && appliedCoupons.map((coupon) => (
                <div key={coupon.id} className="flex justify-between mb-2 text-green-500">
                  <span>Coupon Discount ({coupon.code}):</span>
                  <span>-₹{coupon.discount_amount.toFixed(2)}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>₹{calculateDiscountedTotal().toFixed(2)}</span>
              </div>
              <Link to="/address">
                <Button className="w-full mt-4">
                  Checkout
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mt-4">
              <h2 className="text-lg font-semibold mb-4">Apply Coupon</h2>
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="mr-2"
                />
                <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                  {isApplyingCoupon ? 'Applying...' : 'Apply'}
                </Button>
              </div>
              {appliedCoupons.length > 0 && appliedCoupons.map((coupon) => (
                <div key={coupon.id} className="mt-2 text-sm text-gray-500">
                  Applied Coupon: {coupon.code} ({coupon.discount_amount}% off)
                  <Button variant="link" onClick={() => handleCouponRemove(coupon.id)} className="ml-2">
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

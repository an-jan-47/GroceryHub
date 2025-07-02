
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCouponState } from '@/components/CouponStateManager';
import { Minus, Plus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

export default function Cart() {
  const { cartItems, updateQuantity, removeItem, total, clearCart } = useCart();
  const { appliedCoupons, removeCoupon } = useCouponState();

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const totalDiscount = appliedCoupons.reduce((sum, coupon) => sum + coupon.discountAmount, 0);
  const finalTotal = total - totalDiscount;

  if (cartItems.length === 0) {
    return (
      <div className="pb-20">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to get started!</p>
            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
        
        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-blue-600 font-medium">
                    {formatCurrency(item.salePrice || item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-2 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Applied Coupons */}
        {appliedCoupons.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Applied Coupons
            </h3>
            {appliedCoupons.map((couponData) => (
              <div key={couponData.coupon.id} className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium text-green-600">{couponData.coupon.code}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    -{formatCurrency(couponData.discountAmount)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCoupon(couponData.coupon.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Cart Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrency(totalDiscount)}</span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>{formatCurrency(Math.max(0, finalTotal))}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link to="/coupons">
              <Button variant="outline" className="w-full">
                <Tag className="h-4 w-4 mr-2" />
                Apply Coupon
              </Button>
            </Link>
            
            <Link to="/address">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Proceed to Checkout
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              onClick={clearCart}
              className="w-full text-red-500 hover:text-red-700"
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

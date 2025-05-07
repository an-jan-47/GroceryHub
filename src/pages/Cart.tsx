
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';
import { useAuthCheck } from '@/hooks/useAuthCheck';

const CartPage = () => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthForCheckout } = useAuthCheck();
  
  const deliveryCharge = 3.00;
  const taxRate = 0.05; // 5%
  const subtotal = cartTotal;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryCharge + tax;
  
  const handleCouponApply = () => {
    setIsApplyingCoupon(true);
    setTimeout(() => {
      setIsApplyingCoupon(false);
      if (couponCode.toLowerCase() === 'discount10') {
        toast({
          title: "Coupon applied!",
          description: "10% discount has been applied to your order.",
        });
      } else {
        toast({
          title: "Invalid coupon",
          description: "The coupon code you entered is invalid or expired.",
          variant: "destructive",
        });
      }
    }, 1000);
  };
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user is authenticated before proceeding
    if (checkAuthForCheckout()) {
      // Navigate to address page instead of checkout
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
              {cartItems.map((item) => (
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
                      {item.sale_price ? (
                        <div className="flex items-center">
                          <span className="font-bold text-brand-blue">${item.sale_price.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 line-through ml-1">${item.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold">${item.price.toFixed(2)}</span>
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
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
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
              
              <div className="mt-6 bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span>${deliveryCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
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

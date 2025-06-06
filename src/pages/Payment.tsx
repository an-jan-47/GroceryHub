import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { useCart } from '@/hooks/useCart';
import { useNavigationGestures } from '@/hooks/useNavigationGestures';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { createOrder } from '@/services/orderService';
import { getAddressById } from '@/services/addressService';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createRazorpayOrder, 
  processRazorpayPayment, 
  verifyRazorpayPayment,
  savePaymentDetails 
} from '@/services/paymentService';

const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentMethodsPage = () => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [searchParams] = useSearchParams();
  const addressId = searchParams.get('address');
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { checkAuthForCheckout } = useAuthCheck();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [appliedCouponData, setAppliedCouponData] = useState<any>(null);
  
  useNavigationGestures();
  
  useEffect(() => {
    const storedCouponData = localStorage.getItem('appliedCoupon');
    if (storedCouponData) {
      try {
        setAppliedCouponData(JSON.parse(storedCouponData));
      } catch (error) {
        console.error('Error parsing coupon data:', error);
        localStorage.removeItem('appliedCoupon');
      }
    }
  }, []);
  
  useEffect(() => {
    checkAuthForCheckout();
    
    if (!addressId) {
      toast('Please select a delivery address first');
      navigate('/address');
    }
    
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
          toast('Razorpay SDK failed to load', {
            description: 'Please try another payment method'
          });
        };
        document.body.appendChild(script);
      });
    };
    
    loadRazorpayScript();
  }, [checkAuthForCheckout, addressId, navigate]);
  
  const { data: address, isLoading: isLoadingAddress } = useQuery({
    queryKey: ['address', addressId],
    queryFn: () => addressId ? getAddressById(addressId) : Promise.reject('No address ID'),
    enabled: !!addressId
  });
  
  const platformFees = 5.00;
  const deliveryFees = 0.00;
  const taxRate = 0.18;
  
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.salePrice || item.price;
    const priceWithoutTax = itemPrice / (1 + taxRate);
    return total + (priceWithoutTax * item.quantity);
  }, 0);
  
  const tax = cartItems.reduce((total, item) => {
    const itemPrice = item.salePrice || item.price;
    const taxAmount = (itemPrice * taxRate) / (1 + taxRate);
    return total + (taxAmount * item.quantity);
  }, 0);
  
  const discountAmount = appliedCouponData?.discountAmount || 0;
  const totalBeforeDiscount = subtotal + platformFees + deliveryFees + tax;
  const totalAmount = totalBeforeDiscount - discountAmount;
  
  const createOrderMutation = useMutation({
    mutationFn: async (paymentData: { 
      paymentMethod: string, 
      razorpayPaymentId?: string, 
      razorpayOrderId?: string, 
      razorpaySignature?: string 
    }) => {
      if (!addressId || !user) throw new Error('No address or user found');
      if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty');
      
      const orderResult = await createOrder({
        addressId: addressId,
        userId: user.id,
        paymentMethod: paymentData.paymentMethod,
        totalAmount: totalAmount,
        platformFees: platformFees,
        discountAmount: discountAmount,
        products: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.salePrice || item.price,
          quantity: item.quantity
        }))
      });

      if (paymentData.razorpayPaymentId && orderResult.orderId) {
        await savePaymentDetails({
          orderId: orderResult.orderId,
          paymentId: paymentData.razorpayPaymentId,
          amount: totalAmount,
          status: 'completed',
          method: 'razorpay',
          userId: user.id  // Ensure user_id is included
        });
      }

      return orderResult;
    },
    onSuccess: ({ orderId }) => {
      localStorage.setItem('lastOrderId', orderId!);
      clearCart();
      localStorage.removeItem('appliedCoupon');
      navigate('/order-confirmation');
    },
    onError: (error: any) => {
      console.error('Order creation error:', error);
      toast('Failed to create order', {
        description: error.message
      });
      setIsProcessingPayment(false);
    }
  });

  const initiateRazorpayPayment = async () => {
    if (!window.Razorpay) {
      toast('Razorpay SDK not loaded', {
        description: 'Please try again or use another payment method'
      });
      setIsProcessingPayment(false);
      return;
    }
    
    try {
      const razorpayOrder = await createRazorpayOrder(totalAmount, `order_${Date.now()}`);
      
      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error('Failed to create payment order');
      }
      
      const options = {
        key: razorpayOrder.key_id || 'rzp_test_NhYbBXqUSxpojf',
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'GroceryHub',
        description: 'Purchase from GroceryHub',
        order_id: razorpayOrder.id,
        prefill: {
          name: address?.name || '',
          email: user?.email || '',
          contact: address?.phone || ''
        },
        notes: {
          address: `${address?.address}, ${address?.city}, ${address?.state} ${address?.pincode}`
        },
        theme: {
          color: '#3B82F6'
        }
      };
      
      processRazorpayPayment(
        options,
        async (response) => {
          try {
            await verifyRazorpayPayment(
              response.razorpay_payment_id,
              razorpayOrder.id,
              response.razorpay_signature,
              response.razorpay_order_id
            );
            
            const paymentData = {
              paymentMethod: 'razorpay',
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            };
            
            createOrderMutation.mutate(paymentData);
          } catch (error) {
            console.error('Payment verification failed:', error);
            setIsProcessingPayment(false);
            toast('Payment verification failed', {
              description: 'Please try again or contact support'
            });
          }
        },
        (error) => {
          setIsProcessingPayment(false);
          toast('Payment failed', {
            description: error.description || 'Please try again or use another payment method'
          });
        }
      );
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      setIsProcessingPayment(false);
      toast('Payment initialization failed', {
        description: 'Please try again or use another payment method'
      });
    }
  };

  const handlePayment = () => {
    setIsProcessingPayment(true);
    
    if (!addressId || !user) {
      toast('Missing address or user information');
      setIsProcessingPayment(false);
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      toast('Your cart is empty');
      setIsProcessingPayment(false);
      return;
    }
    
    if (paymentMethod === 'razorpay') {
      initiateRazorpayPayment();
    } else {
      createOrderMutation.mutate({ paymentMethod: 'cod' });
    }
  };

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Payment Method</h1>
        
        {isLoadingAddress ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : address ? (
          <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
            <div className="flex items-center">
              <MapPin className="text-gray-500 mr-3" />
              
              <div>
                <h3 className="font-medium">Deliver to:</h3>
                <p className="text-sm text-gray-700">{address.name} • {address.phone}</p>
                <p className="text-sm text-gray-600">
                  {address.address}, {address.city}, {address.state} {address.pincode}
                </p>
              </div>
            </div>
          </div>
        ) : null}
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={setPaymentMethod} 
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="razorpay" id="razorpay" />
                <Label htmlFor="razorpay" className="flex flex-1 cursor-pointer">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                      <span>Pay via Razorpay</span>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex flex-1 cursor-pointer">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-green-600" />
                      <span>Cash On Delivery</span>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            
            <div className="space-y-2">
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
                <span>₹{deliveryFees.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18% GST)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount ({appliedCouponData?.coupon?.code})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 sticky bottom-20 bg-white pt-4 pb-4">
          <Button 
            onClick={handlePayment}
            disabled={isProcessingPayment || createOrderMutation.isPending}
            className="w-full bg-brand-blue hover:bg-brand-darkBlue"
          >
            {isProcessingPayment || createOrderMutation.isPending ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
          </Button>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default PaymentMethodsPage;
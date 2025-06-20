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
import { validateCoupon, calculateDiscount, type Coupon } from '@/services/couponService';
import { useCouponState } from '@/components/CouponStateManager';

// Constants
const PRICING_CONFIG = {
  platformFees: 5.00,
  deliveryFees: 0.00,
  transactionFeeRate: 0.02, // 2% transaction fee
  razorpayTestKey: 'rzp_test_NhYbBXqUSxpojf'
} as const;

const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentData {
  paymentMethod: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

interface CouponData {
  coupon: Coupon;
  discountAmount: number;
}

const PaymentMethodsPage = () => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [searchParams] = useSearchParams();
  const addressId = searchParams.get('address');
  const navigate = useNavigate();
  
  // Hooks
  const { cartItems = [], cartTotal, clearCart } = useCart();
  const { checkAuthForCheckout } = useAuthCheck();
  const { user } = useAuth();
  const { appliedCoupons, setCoupons } = useCouponState();
  
  // Add navigation gestures
  useNavigationGestures();

  useEffect(() => {
    console.log('Payment page loaded, cart items:', cartItems.length, 'address:', addressId);
    
    if (!cartItems || cartItems.length === 0) {
      toast('Your cart is empty', {
        description: 'Please add items to your cart before proceeding to payment.'
      });
      navigate('/cart');
      return;
    }
  }, [cartItems, navigate]);

  // Calculation functions - NO TAX INCLUDED
  const calculatePricing = () => {
    // Calculate subtotal using sale price when available
    const subtotal = cartItems.reduce((total, item) => {
      const itemPrice = item.salePrice || item.price;
      return total + (itemPrice * Number(item.quantity)); // Ensure quantity is a number
    }, 0);
    
    // Calculate total discount from all applied coupons
    const totalDiscountAmount = appliedCoupons.reduce((total, couponData) => total + couponData.discountAmount, 0);
    
    // Calculate total before transaction fee
    const totalBeforeTransactionFee = subtotal + PRICING_CONFIG.platformFees + PRICING_CONFIG.deliveryFees - totalDiscountAmount;
    
    // Only add transaction fee for Razorpay payment method
    const transactionFee = paymentMethod === 'razorpay' ? Math.round(totalBeforeTransactionFee * PRICING_CONFIG.transactionFeeRate * 100) / 100 : 0;
    
    // Final total calculation
    const totalAmount = totalBeforeTransactionFee + transactionFee;
    
    return {
      subtotal,
      totalDiscountAmount,
      totalBeforeTransactionFee,
      transactionFee,
      totalAmount
    };
  };
  
  const pricing = calculatePricing();
  
  // Load and validate coupons from localStorage
  const loadAndValidateCoupons = async () => {
    const storedCouponData = localStorage.getItem('appliedCoupon');
    if (!storedCouponData) return;
    
    try {
      const parsedData = JSON.parse(storedCouponData);
      
      // Handle both single coupon and multiple coupons format
      let couponsToValidate: any[] = [];
      if (Array.isArray(parsedData)) {
        couponsToValidate = parsedData;
      } else if (parsedData.coupon) {
        couponsToValidate = [parsedData];
      }
      
      const validatedCoupons: CouponData[] = [];
      let totalDiscount = 0;
      
      // Calculate subtotal for validation
      const subtotal = cartItems.reduce((total, item) => {
        const itemPrice = item.salePrice || item.price;
        return total + (itemPrice * item.quantity);
      }, 0);
      
      const orderTotal = subtotal + PRICING_CONFIG.platformFees + PRICING_CONFIG.deliveryFees;
      
      for (const couponData of couponsToValidate) {
        try {
          // Validate each coupon
          const validatedCoupon = await validateCoupon(couponData.coupon.code, orderTotal - totalDiscount);
          const discount = calculateDiscount(validatedCoupon, orderTotal - totalDiscount);
          
          validatedCoupons.push({
            coupon: validatedCoupon,
            discountAmount: discount
          });
          
          totalDiscount += discount;
        } catch (error) {
          console.warn(`Coupon ${couponData.coupon.code} is no longer valid:`, error);
          toast(`Coupon ${couponData.coupon.code} is no longer valid`, {
            description: 'It has been removed from your order'
          });
        }
      }
      
      setCoupons(validatedCoupons);
      
      // Update localStorage with validated coupons
      if (validatedCoupons.length > 0) {
        localStorage.setItem('appliedCoupon', JSON.stringify(validatedCoupons));
      } else {
        localStorage.removeItem('appliedCoupon');
      }
      
    } catch (error) {
      console.error('Error parsing coupon data:', error);
      localStorage.removeItem('appliedCoupon');
      setCoupons([]);
    }
  };
  
  // Load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        resolve(false);
        toast('Razorpay SDK failed to load', {
          description: 'Please try another payment method'
        });
      };
      document.body.appendChild(script);
    });
  };
  
  // Effects
  useEffect(() => {
    if (cartItems.length > 0) {
      loadAndValidateCoupons();
    }
  }, [cartItems, setCoupons]);
  
  useEffect(() => {
    checkAuthForCheckout();
    
    if (!addressId) {
      toast('Please select a delivery address first');
      navigate('/address');
      return;
    }
    
    loadRazorpayScript();
  }, [checkAuthForCheckout, addressId, navigate]);
  
  // Fetch the selected address
  const { data: address, isLoading: isLoadingAddress } = useQuery({
    queryKey: ['address', addressId],
    queryFn: () => addressId ? getAddressById(addressId) : Promise.reject('No address ID'),
    enabled: !!addressId
  });
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (paymentData: PaymentData) => {
      if (!addressId || !user) throw new Error('No address or user found');
      if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty');
      
      // Create order with the final calculated amount (including all discounts, no tax)
      const orderResult = await createOrder({
        addressId: addressId,
        userId: user.id,
        paymentMethod: paymentData.paymentMethod,
        totalAmount: pricing.totalAmount, // This is the final amount with discounts applied
        platformFees: PRICING_CONFIG.platformFees,
        discountAmount: pricing.totalDiscountAmount,
        products: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.salePrice || item.price,
          quantity: item.quantity
        }))
      });

      // If Razorpay payment, save payment details
      if (paymentData.razorpayPaymentId && orderResult.orderId) {
        await savePaymentDetails(
          orderResult.orderId,
          paymentData.razorpayPaymentId,
          pricing.totalAmount, // Use the final calculated amount
          'completed',
          'razorpay'
        );
      }

      return orderResult;
    },
    onSuccess: ({ orderId }) => {
      console.log('Order created successfully, redirecting to confirmation page');
      // Store order ID for confirmation page
      localStorage.setItem('lastOrderId', orderId!);
      
      // Clear the cart and applied coupon
      clearCart();
      localStorage.removeItem('appliedCoupon');
      localStorage.removeItem('groceryHub_cart'); // Add this line to ensure cart is completely cleared
      
      // Add a small delay before navigation to ensure state updates are processed
      setTimeout(() => {
        console.log('Navigating to order confirmation page');
        // Navigate to confirmation - use replace: true to prevent back navigation to payment
        navigate('/order-confirmation', { replace: true });
      }, 100);
    },
    onError: (error: any) => {
      console.error('Order creation error:', error);
      toast('Failed to create order', {
        description: error.message
      });
      setIsProcessingPayment(false);
    }
  });

  // Function to initiate Razorpay payment
  const initiateRazorpayPayment = async () => {
    if (!window.Razorpay) {
      toast('Razorpay SDK not loaded', {
        description: 'Please try again or use another payment method'
      });
      setIsProcessingPayment(false);
      return;
    }
    
    try {
      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(pricing.totalAmount, `order_${Date.now()}`);
      
      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error('Failed to create payment order');
      }
      
      const options = {
        key: razorpayOrder.key_id || PRICING_CONFIG.razorpayTestKey,
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
          // Verify payment
          try {
            await verifyRazorpayPayment(
              response.razorpay_payment_id,
              razorpayOrder.id,
              response.razorpay_signature,
              response.razorpay_order_id
            );
            
            // Create order with payment details
            const paymentData: PaymentData = {
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
    console.log('Payment button clicked');
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

  const renderOrderSummary = () => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">Subtotal</span>
        <span>{formatCurrency(pricing.subtotal)}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Platform Fees</span>
        <span>{formatCurrency(PRICING_CONFIG.platformFees)}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Delivery Fees</span>
        <span>{PRICING_CONFIG.deliveryFees === 0 ? 'FREE' : formatCurrency(PRICING_CONFIG.deliveryFees)}</span>
      </div>
      
      {pricing.transactionFee > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">Transaction Fee (2%)</span>
          <span>{formatCurrency(pricing.transactionFee)}</span>
        </div>
      )}
      
      {appliedCoupons.length > 0 && (
        <div className="space-y-1">
          {appliedCoupons.map((couponData, index) => (
            <div key={index} className="flex justify-between text-green-600">
              <span>Coupon Discount ({couponData.coupon.code})</span>
              <span>-{formatCurrency(couponData.discountAmount)}</span>
            </div>
          ))}
          {appliedCoupons.length > 1 && (
            <div className="flex justify-between text-green-700 font-medium">
              <span>Total Coupon Savings</span>
              <span>-{formatCurrency(pricing.totalDiscountAmount)}</span>
            </div>
          )}
        </div>
      )}
      
      <Separator className="my-2" />
      
      <div className="flex justify-between font-semibold text-lg">
        <span>Total</span>
        <span>{formatCurrency(pricing.totalAmount)}</span>
      </div>
    </div>
  );

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
            {renderOrderSummary()}
          </div>
        </div>
        
        <div className="mt-6 sticky bottom-20 bg-white pt-4 pb-4">
          <Button 
            onClick={handlePayment}
            disabled={isProcessingPayment || createOrderMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 text-lg"
          >
            {isProcessingPayment || createOrderMutation.isPending ? 'Processing...' : `Pay ${formatCurrency(pricing.totalAmount)}`}
          </Button>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default PaymentMethodsPage;

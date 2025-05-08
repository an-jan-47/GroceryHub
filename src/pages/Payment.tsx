
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, CreditCard, Wallet, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { createOrder } from '@/services/orderService';
import { getAddressById, Address } from '@/services/addressService';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useAuth } from '@/contexts/AuthContext';

const PaymentMethodsPage = () => {
  const [selectedMethod, setSelectedMethod] = useState('cod');  // Default to COD
  const [showRazorpaySheet, setShowRazorpaySheet] = useState(false);
  const [searchParams] = useSearchParams();
  const addressId = searchParams.get('address');
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { checkAuthForCheckout } = useAuthCheck();
  const { user } = useAuth();

  // Check if user is authenticated
  useEffect(() => {
    checkAuthForCheckout();
    
    if (!addressId) {
      toast('Please select a delivery address first');
      navigate('/address');
    }
  }, []);
  
  // Fetch the selected address
  const { data: address, isLoading: isLoadingAddress } = useQuery({
    queryKey: ['address', addressId],
    queryFn: () => addressId ? getAddressById(addressId) : Promise.reject('No address ID'),
    enabled: !!addressId
  });
  
  // Calculate costs
  const deliveryCharge = cartTotal > 50 ? 0 : 5;
  const taxRate = 0.08;
  const tax = cartTotal * taxRate;
  const totalAmount = cartTotal + deliveryCharge + tax;
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!addressId || !user) throw new Error('No address or user found');
      
      // Fixed: Create order with correct parameters
      return createOrder(
        user.id,
        {
          addressId,
          products: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.salePrice || item.price,
            quantity: item.quantity
          })),
          paymentMethod: selectedMethod
        }
      );
    },
    onSuccess: ({ orderId }) => {
      // Store order ID for confirmation page
      localStorage.setItem('lastOrderId', orderId!);
      
      // Clear the cart
      clearCart();
      
      // Navigate to confirmation
      navigate('/order-confirmation');
    },
    onError: (error: any) => {
      toast('Failed to create order', {
        description: error.message
      });
    }
  });

  const handlePayment = () => {
    if (selectedMethod === 'razorpay') {
      setShowRazorpaySheet(true);
    } else if (selectedMethod === 'cod') {
      createOrderMutation.mutate();
    } else {
      toast('Please select a valid payment method');
    }
  };
  
  const handleProcessPayment = () => {
    setShowRazorpaySheet(false);
    createOrderMutation.mutate();
  };

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="py-3 flex items-center">
          <Link to="/address" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Address</span>
          </Link>
        </div>
        
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
            <h2 className="font-semibold text-lg mb-4">Select Payment Method</h2>
            
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-3">
              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex flex-1 cursor-pointer">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-green-600" />
                      <span>Cash On Delivery</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recommended</span>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="razorpay" id="razorpay" />
                <Label htmlFor="razorpay" className="flex flex-1 cursor-pointer">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-3 text-brand-blue" />
                      <span>Razorpay</span>
                    </div>
                    <img src="/placeholder.svg" alt="Razorpay" className="h-6" />
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-lg p-4 opacity-50">
                <RadioGroupItem value="upi" id="upi" disabled />
                <Label htmlFor="upi" className="flex flex-1 cursor-not-allowed">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                      <Wallet className="w-5 h-5 mr-3 text-gray-400" />
                      <span>UPI</span>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Coming soon</span>
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
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${deliveryCharge.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 sticky bottom-20 bg-white pt-4 pb-4">
          <Button 
            onClick={handlePayment}
            disabled={createOrderMutation.isPending || !address}
            className="w-full bg-brand-blue hover:bg-brand-darkBlue"
          >
            {createOrderMutation.isPending 
              ? 'Processing...' 
              : selectedMethod === 'cod' ? 'Place Order' : 'Pay Now'}
          </Button>
        </div>
        
        {/* Razorpay Payment Sheet */}
        <Sheet open={showRazorpaySheet} onOpenChange={setShowRazorpaySheet}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Razorpay Payment</SheetTitle>
              <SheetDescription>
                Securely pay using Razorpay
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="text-sm text-gray-600">ORD-{Math.floor(Math.random() * 1000000)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber" className="text-sm">Card Number</Label>
                  <div className="border rounded p-3 bg-white">
                    <input 
                      type="text"
                      id="cardNumber"
                      placeholder="4111 1111 1111 1111"
                      className="w-full outline-none"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry" className="text-sm">Expiry Date</Label>
                    <div className="border rounded p-3 bg-white">
                      <input 
                        type="text"
                        id="expiry"
                        placeholder="MM/YY"
                        className="w-full outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv" className="text-sm">CVV</Label>
                    <div className="border rounded p-3 bg-white">
                      <input 
                        type="text"
                        id="cvv"
                        placeholder="123"
                        className="w-full outline-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="name" className="text-sm">Name on Card</Label>
                  <div className="border rounded p-3 bg-white">
                    <input 
                      type="text"
                      id="name"
                      placeholder="John Doe"
                      className="w-full outline-none"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleProcessPayment} 
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-brand-blue hover:bg-brand-darkBlue"
                >
                  {createOrderMutation.isPending ? 'Processing...' : 'Pay Now'}
                </Button>
                
                <div className="text-center">
                  <img src="/placeholder.svg" alt="Razorpay Secure" className="h-6 inline-block" />
                  <p className="text-xs text-gray-500 mt-2">Payments secured by Razorpay</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default PaymentMethodsPage;

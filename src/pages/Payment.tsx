
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, Wallet, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const PaymentMethodsPage = () => {
  const [selectedMethod, setSelectedMethod] = useState('cod');  // Default to COD
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRazorpaySheet, setShowRazorpaySheet] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCartTotal, clearCart } = useCart();
  
  const cartTotal = getCartTotal();
  
  const handlePayment = () => {
    if (selectedMethod === 'razorpay') {
      setShowRazorpaySheet(true);
    } else if (selectedMethod === 'cod') {
      setIsProcessing(true);
      
      // Simulate processing for COD
      setTimeout(() => {
        setIsProcessing(false);
        
        // Generate a unique order ID and store it for the confirmation page
        const orderId = generateOrderId();
        localStorage.setItem('lastOrderId', orderId);
        
        // Clear the cart
        clearCart();
        
        // Navigate to confirmation
        navigate('/order-confirmation');
      }, 1500);
    } else {
      toast({
        title: 'Payment Method Not Available',
        description: 'Please select a valid payment method.',
      });
    }
  };
  
  const handleProcessPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowRazorpaySheet(false);
      
      // Generate a unique order ID and store it for the confirmation page
      const orderId = generateOrderId();
      localStorage.setItem('lastOrderId', orderId);
      
      // Clear the cart
      clearCart();
      
      navigate('/order-confirmation');
    }, 2000);
  };
  
  // Generate a unique order ID
  const generateOrderId = () => {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}${random}`;
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
                <span>${(cartTotal > 50 ? 0 : 5).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${(cartTotal * 0.08).toFixed(2)}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${(cartTotal + (cartTotal > 50 ? 0 : 5) + cartTotal * 0.08).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 sticky bottom-20 bg-white pt-4 pb-4">
          <Button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-brand-blue hover:bg-brand-darkBlue"
          >
            {isProcessing ? 'Processing...' : selectedMethod === 'cod' ? 'Place Order' : 'Pay Now'}
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
                  <span className="font-semibold">${(cartTotal + (cartTotal > 50 ? 0 : 5) + cartTotal * 0.08).toFixed(2)}</span>
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
                  disabled={isProcessing}
                  className="w-full bg-brand-blue hover:bg-brand-darkBlue"
                >
                  {isProcessing ? 'Processing...' : 'Pay Now'}
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddresses, createOrder } from '@/services/orderService';
import { useCart } from '@/hooks/useCart';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useCouponState } from '@/components/CouponStateManager';

const Payment = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { appliedCoupons, getTotalDiscount } = useCouponState();

  const { data: addresses, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses
  });

  const { mutate: createOrderMutation } = useMutation(createOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      clearCart();
      navigate('/order-confirmation');
    },
    onError: (error) => {
      console.error('Create order failed:', error);
      toast('Failed to create order', {
        description: 'Please try again or contact support'
      });
    }
  });

  const calculateTotal = (cartTotal: number, appliedCoupons: any[]) => {
    const discount = appliedCoupons.reduce((total: number, couponData: any) => total + couponData.discount_amount, 0);
    return cartTotal - discount;
  };

  const finalTotal = calculateTotal(cartTotal, appliedCoupons);

  const handleAddressSelect = (address: any) => {
    setSelectedAddress(address);
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  const handlePayment = async () => {
    if (!selectedAddress || !paymentMethod) {
      toast('Please select address and payment method');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        address_id: selectedAddress.id,
        payment_method: paymentMethod,
        total_amount: finalTotal,
        items: cartItems,
        applied_coupons: appliedCoupons
      };

      console.log('Creating order with data:', orderData);
      
      const order = await createOrder(orderData);
      
      if (order?.id) {
        navigate('/order-confirmation', { 
          state: { 
            orderId: order.id,
            orderNumber: order.id.slice(0, 8).toUpperCase()
          }
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast('Payment failed', {
        description: 'Please try again or contact support'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto space-y-6">
        <div className="py-3">
          <Link to="/address" className="flex items-center text-gray-500">
            <span>Back to Address</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Payment</h1>
        
        {/* Address Selection */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Select Delivery Address</h2>
          
          {isLoadingAddresses ? (
            <div>Loading addresses...</div>
          ) : addresses && addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((address: any) => (
                <Card 
                  key={address.id}
                  className={`border ${selectedAddress?.id === address.id ? 'border-blue-500' : 'border-gray-200'} cursor-pointer`}
                  onClick={() => handleAddressSelect(address)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium">{address.full_name}</p>
                    <p className="text-sm text-gray-500">{address.street}, {address.city}, {address.state} - {address.zip_code}</p>
                    <p className="text-sm text-gray-500">Phone: {address.phone}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div>No addresses found. <Link to="/address" className="text-blue-500">Add a new address</Link></div>
          )}
        </div>
        
        {/* Payment Method Selection */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
          
          <RadioGroup defaultValue={paymentMethod} className="space-y-2" onValueChange={handlePaymentMethodChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credit_card" id="credit_card" className="border rounded-full h-4 w-4" />
              <Label htmlFor="credit_card">Credit Card</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paypal" id="paypal" className="border rounded-full h-4 w-4" />
              <Label htmlFor="paypal">PayPal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" className="border rounded-full h-4 w-4" />
              <Label htmlFor="cash_on_delivery">Cash on Delivery</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Applied Coupons Section */}
        {appliedCoupons.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Applied Coupons</h3>
            <div className="space-y-2">
              {appliedCoupons.map((couponData: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm font-medium">{couponData.code}</span>
                  <span className="text-sm text-green-600">-₹{couponData.discount_amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          
          <div className="flex justify-between items-center mb-2">
            <span>Subtotal:</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span>Discount:</span>
            <span>-₹{getTotalDiscount().toFixed(2)}</span>
          </div>
          
          <div className="border-t py-2 border-gray-200 flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold">₹{finalTotal.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Payment Button */}
        <Button 
          className="w-full"
          onClick={handlePayment}
          disabled={!selectedAddress || !paymentMethod || isProcessing}
        >
          {isProcessing ? 'Processing Payment...' : 'Complete Payment'}
        </Button>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Payment;

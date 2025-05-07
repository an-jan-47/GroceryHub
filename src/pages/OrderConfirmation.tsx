
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const OrderConfirmationPage = () => {
  const [orderId, setOrderId] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  
  // Scroll to top on component mount and get the order ID from localStorage
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Get the order ID from localStorage
    const savedOrderId = localStorage.getItem('lastOrderId');
    if (savedOrderId) {
      setOrderId(savedOrderId);
      
      // Set current date for display
      const date = new Date();
      setOrderDate(date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    } else {
      // Fallback to a random order ID if none is stored
      setOrderId(`ORD-${Math.floor(Math.random() * 1000000)}`);
      setOrderDate('May 7, 2025');
    }
  }, []);
  
  // Calculate expected delivery date (3-5 days from now)
  const getDeliveryDateRange = () => {
    const today = new Date();
    const deliveryStart = new Date(today);
    deliveryStart.setDate(today.getDate() + 3);
    
    const deliveryEnd = new Date(today);
    deliveryEnd.setDate(today.getDate() + 5);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };
    
    return `${formatDate(deliveryStart)} - ${formatDate(deliveryEnd)}`;
  };
  
  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-8 mx-auto">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-fade-in">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We've received your payment and will process your order soon.
          </p>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full max-w-md mb-8">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Order Details</h2>
                <span className="text-sm text-gray-500">{orderDate}</span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium">{orderId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span>Online Payment</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600">Confirmed</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full max-w-md mb-8">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Estimated Delivery</h2>
            </div>
            
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <p className="font-medium">{getDeliveryDateRange()}</p>
                  <p className="text-sm text-gray-500">Standard Shipping</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  You will receive an email with tracking information once your order ships.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 w-full max-w-md">
            <Button asChild className="w-full bg-brand-blue hover:bg-brand-darkBlue">
              <Link to="/order-history">View Your Orders</Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default OrderConfirmationPage;

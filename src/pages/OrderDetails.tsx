
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Package, MapPin, Clock, CreditCard, Truck, CheckCircle, AlertCircle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { getOrderById, subscribeToOrderUpdates } from '@/services/orderService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

const OrderDetails = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  // Use React Query for data fetching and caching
  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) throw new Error('No order ID provided');
      return await getOrderById(id);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Set up real-time subscription to order updates
  useEffect(() => {
    if (!id) return;
    
    console.log('Setting up real-time subscription for order:', id);
    
    // Subscribe to changes on this specific order
    const subscription = subscribeToOrderUpdates(id, (payload) => {
      console.log('Order updated via realtime:', payload);
      // Invalidate the query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    });
    
    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up order subscription for:', id);
      subscription.unsubscribe();
    };
  }, [id, queryClient]);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Processing':
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'Shipped':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Shipped</Badge>;
      case 'Delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen">
        <Header />
        <main className="container px-4 py-4 mx-auto max-w-3xl">
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }
  
  if (!orderData || !orderData.order) {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen">
        <Header />
        <main className="container px-4 py-4 mx-auto max-w-3xl">
          <div className="py-3 flex items-center">
            <Link to="/order-history" className="flex items-center text-gray-500">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span>Back to Orders</span>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Order not found</h3>
            <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button asChild>
              <Link to="/order-history">View All Orders</Link>
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }
  
  const { order, items } = orderData;
  
  // Calculate costs without GST/tax
  const platformFees = order.platform_fees || 5.00;
  const deliveryFees = 0.00; // Set to 0 as requested
  
  // Calculate subtotal (original item prices without any tax complications)
  const subtotal = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Calculate Razorpay transaction fees (2% on subtotal + platform fees) only if payment method is not COD
  const transactionFeesBase = subtotal + platformFees;
  const razorpayFees = order.payment_method !== 'cod' ? transactionFeesBase * 0.02 : 0; // 2% transaction fees only for non-COD
  
  // Discount amount from the order
  const discountAmount = order.discount_amount || 0;
  
  // Get applied coupon information from localStorage for display
  const getAppliedCoupons = () => {
    try {
      const storedCouponData = localStorage.getItem('appliedCoupon');
      if (storedCouponData) {
        const parsedData = JSON.parse(storedCouponData);
        if (Array.isArray(parsedData)) {
          return parsedData;
        } else if (parsedData.coupon) {
          return [parsedData];
        }
      }
    } catch (error) {
      console.error('Error parsing stored coupon data:', error);
    }
    return [];
  };
  
  const appliedCoupons = getAppliedCoupons();
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header />
      
      <main className="container px-4 py-4 mx-auto max-w-3xl">
        <div className="py-3 flex items-center">
          <Link to="/order-history" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Orders</span>
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Order Details</h1>
          {getStatusBadge(order.status)}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{formatDate(order.order_date)}</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              {order.status === 'Delivered' 
                ? 'Delivered on ' + formatDate(order.order_date) 
                : order.status === 'Shipped'
                ? 'Shipped on ' + formatDate(order.order_date)
                : 'Ordered on ' + formatDate(order.order_date)}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>
              {order.payment_method === 'cod' 
                ? 'Cash on Delivery' 
                : order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="font-semibold mb-3">Delivery Address</h2>
          
          {order.address ? (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">{order.address.name}</p>
                <p className="text-sm text-gray-600">{order.address.phone}</p>
                <p className="text-sm text-gray-600">
                  {order.address.address}, {order.address.city}, {order.address.state} {order.address.pincode}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Address information not available</p>
          )}
        </div>
        
        {/* Applied Coupons Section */}
        {(discountAmount > 0 || appliedCoupons.length > 0) && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 className="font-semibold mb-3 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-green-600" />
              Applied Coupons
            </h2>
            
            {appliedCoupons.length > 0 ? (
              <div className="space-y-2">
                {appliedCoupons.map((couponData, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-green-800">{couponData.coupon.code}</span>
                        <p className="text-sm text-green-600">
                          {couponData.coupon.type === 'percentage' 
                            ? `${couponData.coupon.value}% discount` 
                            : `₹${couponData.coupon.value} discount`}
                        </p>
                      </div>
                      <span className="text-green-700 font-medium">
                        -₹{couponData.discountAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {appliedCoupons.length > 1 && (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-800">Total Coupon Savings</span>
                      <span className="text-green-700 font-bold">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : discountAmount > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-800">Discount Applied</span>
                  <span className="text-green-700 font-medium">-₹{discountAmount.toFixed(2)}</span>
                </div>
              </div>
            ) : null}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="font-semibold mb-3">Order Items</h2>
          
          {items && items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center mr-3">
                    {item.product && item.product.images && item.product.images[0] ? (
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.product ? item.product.name : `Product ${item.product_id.substring(0, 8)}`}
                    </p>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-medium">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No items found for this order</p>
          )}
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Platform Fees</span>
              <span>{formatCurrency(platformFees)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-green-500">
              <span className="text-green-500">Delivery Fee</span>
              <span>{"FREE"}</span>
            </div>
            
            {razorpayFees > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transaction Handling Fee</span>
                <span>{formatCurrency(razorpayFees)}</span>
              </div>
            )}
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Total Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="text-sm text-green-600 text-center mt-2">
                🎉 You saved ₹{discountAmount.toFixed(2)} on this order!
              </div>
            )}
          </div>
        </div>
        
        {order.status === 'Delivered' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">This order has been delivered successfully.</p>
          </div>
        )}
        
        {order.status === 'Shipped' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <Truck className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-blue-700">Your order is on the way!</p>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default OrderDetails;

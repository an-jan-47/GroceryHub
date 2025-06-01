
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Package, MapPin, Clock, CreditCard, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { getOrderById } from '@/services/orderService';
import { formatCurrency } from '@/utils/formatters';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const OrderDetails = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Use React Query for data fetching and caching
  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) throw new Error('No order ID provided');
      
      // First get the basic order data
      const data = await getOrderById(id);
      
      // Then fetch the latest status directly from the database
      const { data: statusData, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', id)
        .single();
      
      if (!error && statusData) {
        // Update the order status with the latest from the database
        data.order.status = statusData.status;
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Set up real-time subscription to order updates
  useEffect(() => {
    if (!id || isSubscribed) return;
    
    // Subscribe to changes on this specific order
    const subscription = supabase
      .channel(`order-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${id}`
      }, (payload) => {
        console.log('Order updated:', payload);
        // Invalidate the query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['order', id] });
      })
      .subscribe();
    
    setIsSubscribed(true);
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
      setIsSubscribed(false);
    };
  }, [id, queryClient, isSubscribed]);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Processing':
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
                ? 'Delivered on ' + formatDate(order.delivery_date || order.order_date) 
                : order.status === 'Shipped'
                ? 'Shipped on ' + formatDate(order.shipped_date || order.order_date)
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
              <span>{formatCurrency(items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery Fee</span>
              <span>{formatCurrency(order.delivery_fee || 0)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax</span>
              <span>{formatCurrency(order.tax || 0)}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
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

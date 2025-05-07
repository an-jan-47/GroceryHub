
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, ShoppingBag, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { OrderWithItems, getOrderById, cancelOrder, OrderStatus } from '@/services/orderService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddressById } from '@/services/addressService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { trackError } from '@/utils/errorTracking';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { loadingStates, withLoading } = useLoadingStates({ cancelOrder: false });
  
  const [optimisticStatus, setOptimisticStatus] = useState<OrderStatus | null>(null);
  
  // Fetch order details
  const { 
    data: order, 
    isLoading: isLoadingOrder, 
    error: orderError 
  } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
    retry: 1,
    onSettled: (_, error) => {
      if (error) {
        trackError(error, { orderId: id });
        toast("Error loading order", {
          description: "Could not load order details. Please try again later."
        });
      }
    }
  });
  
  // Fetch address details if order is loaded
  const { 
    data: address, 
    isLoading: isLoadingAddress 
  } = useQuery({
    queryKey: ['address', order?.address_id],
    queryFn: () => getAddressById(order!.address_id),
    enabled: !!order?.address_id,
  });
  
  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onMutate: async (orderId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });
      
      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData<OrderWithItems>(['order', orderId]);
      
      // Optimistically update to the new value
      if (previousOrder) {
        queryClient.setQueryData(['order', orderId], {
          ...previousOrder,
          status: 'Cancelled'
        });
        
        // Store optimistic status
        setOptimisticStatus('Cancelled');
      }
      
      return { previousOrder };
    },
    onError: (error, orderId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousOrder) {
        queryClient.setQueryData(['order', orderId], context.previousOrder);
      }
      
      setOptimisticStatus(null);
      trackError(error, { action: 'cancelOrder', orderId });
      toast("Error cancelling order", {
        description: "Could not cancel your order. Please try again later."
      });
    },
    onSuccess: () => {
      toast("Order cancelled", {
        description: "Your order has been successfully cancelled."
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    }
  });
  
  const handleCancelOrder = withLoading('cancelOrder', async () => {
    if (!id) return;
    
    // Show confirmation dialog
    if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      cancelOrderMutation.mutate(id);
    }
  });
  
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Determine order status (use optimistic status if available)
  const orderStatus = optimisticStatus || (order?.status || 'Processing');
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (orderError) {
    return (
      <div className="pb-20">
        <Header />
        
        <main className="container px-4 py-4 mx-auto">
          <div className="py-3 flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-500"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
          
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              We couldn't load the order details. Please try again later or contact customer support.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-8">
            <Button onClick={() => navigate('/order-history')}>
              Back to Orders
            </Button>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    );
  }
  
  if (isLoadingOrder || !order) {
    return (
      <div className="pb-20">
        <Header />
        
        <main className="container px-4 py-4 mx-auto">
          <div className="py-3 flex items-start">
            <div className="w-full">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
              
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-6 w-48"></div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="p-4 border-b">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="animate-pulse p-4">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="py-3 flex items-center">
          <Link to="/order-history" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Orders</span>
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Order Details</h1>
          <Badge variant="outline" className={`${getStatusColor(orderStatus)} flex items-center space-x-1`}>
            <Package className="w-3.5 h-3.5 mr-1" />
            <span>{orderStatus}</span>
          </Badge>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Order Information</h2>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-medium">{order.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date Placed</span>
                <span>{formatDate(order.order_date)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span>{order.payment_method}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-semibold">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Items</h2>
          </div>
          
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center">
                <Link to={`/product/${item.product_id}`} className="flex-shrink-0 w-16 h-16">
                  <img 
                    src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/placeholder.svg'} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover rounded-md"
                  />
                </Link>
                <div className="ml-4 flex-grow">
                  <Link to={`/product/${item.product_id}`} className="font-medium text-gray-800 hover:text-brand-blue">
                    {item.product.name}
                  </Link>
                  <div className="mt-1 flex justify-between">
                    <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${(order.total_amount * 0.9).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${(order.total_amount * 0.1).toFixed(2)}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {isLoadingAddress ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 p-4">
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-56"></div>
            </div>
          </div>
        ) : address ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Shipping Address</h2>
            </div>
            
            <div className="p-4">
              <div className="flex items-start">
                <MapPin className="text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">{address.name} • {address.phone}</p>
                  <p className="text-gray-600">
                    {address.address}, {address.city}, {address.state} {address.pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
        {orderStatus !== 'Cancelled' && orderStatus !== 'Delivered' && (
          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleCancelOrder}
              disabled={loadingStates.cancelOrder}
            >
              {loadingStates.cancelOrder ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </div>
        )}
        
        {orderStatus === 'Delivered' && (
          <div className="mt-6 space-y-4">
            <Button 
              variant="default" 
              className="w-full bg-brand-blue hover:bg-brand-darkBlue"
              onClick={() => {
                // This would typically navigate to a review form
                toast("Review feature coming soon", {
                  description: "The ability to leave product reviews will be available soon."
                });
              }}
            >
              Write a Review
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // This would navigate to a return form or flow
                toast("Return feature coming soon", {
                  description: "The ability to return products will be available soon."
                });
              }}
            >
              Request Return
            </Button>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default OrderDetails;

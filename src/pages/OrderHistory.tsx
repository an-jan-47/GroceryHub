
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Package, ShoppingBag, Search, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserOrders, subscribeToUserOrdersUpdates } from '@/services/orderService';
import PullToRefreshWrapper from '@/components/PullToRefresh';

const OrderHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch orders from backend
  const { 
    data: orders = [], 
    isLoading,
    refetch  // Add refetch here
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => getUserOrders(user?.id),
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Set up real-time subscription to order updates
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up real-time subscription for user orders');
    
    // Subscribe to changes on orders for this user
    const subscription = subscribeToUserOrdersUpdates(user.id, (payload) => {
      console.log('Orders updated via realtime:', payload);
      // Invalidate the query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['orders', user.id] });
    });
    
    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up order subscription');
      subscription.unsubscribe();
    };
  }, [user, queryClient]);

  // Filter orders by ID
  const filteredOrders = orders ? orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

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
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <Package className="w-4 h-4" />;
      case 'Processing':
        return <Clock className="w-4 h-4" />;
      case 'Shipped':
        return <Package className="w-4 h-4" />;
      case 'Cancelled':
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="pb-20">
      <Header />
      <PullToRefreshWrapper onRefresh={refetch}>
        <main className="container px-4 py-4 mx-auto">
          <div className="py-3 flex items-center">
            <Link to="/profile" className="flex items-center text-gray-500">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span>Back to Profile</span>
            </Link>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">My Orders</h1>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID"
              className="pl-10"
            />
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              {searchQuery ? (
                <>
                  <h2 className="text-xl font-medium mb-2">No matching orders</h2>
                  <p className="text-gray-500 mb-6">Try a different search term or clear your filter</p>
                  <Button onClick={() => setSearchQuery('')} variant="outline">
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-medium mb-2">No orders yet</h2>
                  <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet</p>
                  <Button asChild className="bg-brand-blue hover:bg-brand-darkBlue">
                    <Link to="/">Start Shopping</Link>
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Link
                  to={`/order/${order.id}`} 
                  key={order.id}
                  className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order header */}
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{order.id}</div>
                        <div className="flex items-center mt-1 text-sm text-gray-500 space-x-2">
                          <Calendar className="w-3.5 h-3.5 inline mr-1" />
                          <span>{formatDate(order.order_date)}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Order items */}
                  <div className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-grow overflow-hidden">
                        <div className="text-xs text-gray-500 mt-1">
                          Payment: {order.payment_method}
                        </div>
                      </div>
                      
                      <span className="flex items-center text-brand-blue text-sm font-medium">
                        <span>Details</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                    
                    {order.status === 'Delivered' && (
                      <div className="mt-4 pt-3 border-t flex justify-end">
                        <Button variant="outline" size="sm" className="text-xs" onClick={(e) => {
                          e.preventDefault(); // Prevent navigation from the link
                          // Add buy again functionality
                        }}>
                          Buy Again
                        </Button>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </PullToRefreshWrapper>
      <BottomNavigation />
    </div>
  );
};

export default OrderHistory;

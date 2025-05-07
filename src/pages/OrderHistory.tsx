
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Package, ShoppingBag, Search, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getOrders, OrderWithItems } from '@/services/orderService';

const OrderHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  
  // Fetch orders from backend
  const { 
    data: orders = [], 
    isLoading,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: !!user // Only fetch if user is authenticated
  });

  // Filter orders by ID
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {filteredOrders.map((order: OrderWithItems) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order header */}
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{order.id}</div>
                      <div className="flex items-center mt-1 text-sm text-gray-500 space-x-2">
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                        <span>{formatDate(order.order_date)}</span>
                        <span>•</span>
                        <span>{order.items.reduce((acc, item) => acc + item.quantity, 0)} item(s)</span>
                        <span>•</span>
                        <span>${order.total_amount.toFixed(2)}</span>
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
                    <div className="flex flex-shrink-0">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div 
                          key={`${order.id}-${item.id}-${index}`} 
                          className="w-12 h-12 rounded overflow-hidden border relative"
                          style={{ marginLeft: index > 0 ? '-0.75rem' : 0 }}
                        >
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                          {item.quantity > 1 && (
                            <div className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-tl">
                              x{item.quantity}
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-sm font-medium" style={{ marginLeft: '-0.75rem' }}>
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow overflow-hidden">
                      {order.items.slice(0, 1).map((item) => (
                        <div key={`${order.id}-${item.id}-name`} className="text-sm font-medium truncate">
                          {item.product.name}{order.items.length > 1 ? ' and more' : ''}
                        </div>
                      ))}
                      <div className="text-xs text-gray-500 mt-1">
                        Payment: {order.payment_method}
                      </div>
                    </div>
                    
                    <Link 
                      to={`/order/${order.id}`} 
                      className="flex items-center text-brand-blue text-sm font-medium"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  
                  {order.status === 'Delivered' && (
                    <div className="mt-4 pt-3 border-t flex justify-end">
                      <Button variant="outline" size="sm" className="text-xs">
                        Buy Again
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default OrderHistory;

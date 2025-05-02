
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Package, ShoppingBag, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';

// Placeholder order data for demonstration
const MOCK_ORDERS = [
  {
    id: 'ORD-123456',
    date: '2025-05-01',
    total: 129.99,
    items: 3,
    status: 'Delivered',
  },
  {
    id: 'ORD-123455',
    date: '2025-04-25',
    total: 89.50,
    items: 2,
    status: 'Processing',
  },
  {
    id: 'ORD-123454',
    date: '2025-04-15',
    total: 45.75,
    items: 1,
    status: 'Cancelled',
  },
  {
    id: 'ORD-123453',
    date: '2025-04-05',
    total: 210.25,
    items: 4,
    status: 'Delivered',
  },
];

const OrderHistory = () => {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulating API fetch delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        
        <h1 className="text-2xl font-bold mb-4">Order History</h1>
        
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
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
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
          <div className="bg-white shadow-sm rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>{order.items} item{order.items !== 1 ? 's' : ''}</TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost" 
                          size="sm"
                          asChild
                        >
                          <Link to={`/order/${order.id}`}>
                            Details
                            <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default OrderHistory;

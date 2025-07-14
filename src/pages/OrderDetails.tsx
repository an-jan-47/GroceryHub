import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { subscribeToOrderUpdates } from '@/services/orderService';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  address_id: string;
  payment_method: string;
  user_id: string;
  status: string;
}

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, error, isLoading, refetch } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      const unsubscribe = subscribeToOrderUpdates(id, (payload: any) => {
        console.log('Order updated:', payload);
        // Refetch order data when updated
        refetch();
      });

      return unsubscribe;
    }
  }, [id, refetch]);

  if (isLoading) {
    return <div>Loading order details...</div>;
  }

  if (error) {
    return <div>Error loading order details: {error.message}</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  // Mock order items and details for now since the database structure might be different
  const mockOrderItems = [
    {
      id: '1',
      name: 'Sample Product',
      quantity: 1,
      price: order.total_amount || 0,
      image: '/placeholder-product.jpg'
    }
  ];

  const calculateSubtotal = () => {
    return mockOrderItems.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    return 50;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto space-y-6">
        {/* Order Information */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Order ID: <span className="font-medium">{order.id}</span></p>
              <p className="text-gray-600">Order Date: <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span></p>
              <p className="text-gray-600">Status: <span className="font-medium">{order.status}</span></p>
            </div>
            <div>
              <h4 className="font-medium">Shipping Address</h4>
              <p className="text-gray-600">123 Main St</p>
              <p className="text-gray-600">Anytown, CA 12345</p>
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {mockOrderItems.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <div className="flex items-center">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="ml-4">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium">₹{calculateShipping().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">₹0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-semibold">Total:</span>
              <span className="font-semibold">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default OrderDetails;

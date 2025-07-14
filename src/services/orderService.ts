import { supabase } from '@/integrations/supabase/client';
import { Order, CartItem } from '@/types';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name: string;
}

export interface CreateOrderData {
  user_id: string;
  address_id: string;
  total_amount: number;
  payment_method: string;
  payment_status?: string;
  items: CartItem[];
}

export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        address_id: orderData.address_id,
        total_amount: orderData.total_amount,
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status || 'pending',
        status: 'Processing',
        order_date: new Date().toISOString(),
        products_name: orderData.items.map(item => item.name)
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.sale_price || item.price,
      product_name: item.name
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to rollback the order
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    return order;
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Order not found
      }
      console.error('Error fetching order:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    throw error;
  }
};

export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrderItems:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (orderId: string, paymentStatus: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'Cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    throw error;
  }
};

export const getOrdersByStatus = async (userId: string, status: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Error fetching orders by status:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrdersByStatus:', error);
    throw error;
  }
};

export const getRecentOrders = async (userId: string, limit: number = 5): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('order_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRecentOrders:', error);
    throw error;
  }
};

export const getUserOrdersCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user orders count:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getUserOrdersCount:', error);
    throw error;
  }
};

export const getOrdersByDateRange = async (
  userId: string, 
  startDate: string, 
  endDate: string
): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .gte('order_date', startDate)
      .lte('order_date', endDate)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Error fetching orders by date range:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrdersByDateRange:', error);
    throw error;
  }
};

export const getTotalOrderValue = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', userId)
      .eq('payment_status', 'completed');

    if (error) {
      console.error('Error fetching total order value:', error);
      throw error;
    }

    const total = data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    return total;
  } catch (error) {
    console.error('Error in getTotalOrderValue:', error);
    throw error;
  }
};

export const requestOrderReturn = async (orderId: string, reason: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'Return Requested',
        return_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error requesting order return:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in requestOrderReturn:', error);
    throw error;
  }
};

export const getOrderStatistics = async (userId: string) => {
  try {
    const orders = await getUserOrders(userId);
    
    const stats = {
      total: orders.length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
      totalValue: orders
        .filter(o => o.payment_status === 'completed')
        .reduce((sum, o) => sum + o.total_amount, 0)
    };

    return stats;
  } catch (error) {
    console.error('Error in getOrderStatistics:', error);
    throw error;
  }
};

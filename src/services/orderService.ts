import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/hooks/useCart';

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  payment_method: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface CreateOrderData {
  address_id: string;
  payment_method: string;
  total_amount: number;
  items: CartItem[];
  applied_coupons: any[];
}

// Add this function for real-time order updates
export const subscribeToOrderUpdates = (orderId: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('order-updates')
    .on('postgres_changes', 
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, 
      callback
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const createOrder = async (orderData: CreateOrderData): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    return data as Order;
  } catch (error) {
    console.error('Failed to create order:', error);
    return null;
  }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return data as Order;
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return null;
  }
};

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return data as Order[];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }
};

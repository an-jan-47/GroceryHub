
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/components/ui/sonner";

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

// Add the missing types that were referenced in OrderHistory and OrderDetails
export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: {
      id: string;
      name: string;
      price: number;
      images: string[];
    }
  })[];
}

interface CreateOrderParams {
  addressId: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  paymentMethod: string;
}

// Get order history for a user
export const getUserOrders = async (userId?: string): Promise<Order[]> => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('order_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

// Add the missing getOrders function that's used in OrderHistory.tsx
export const getOrders = async (): Promise<OrderWithItems[]> => {
  try {
    // Get all orders with their items
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false });
    
    if (ordersError) throw ordersError;
    
    if (!orders || orders.length === 0) return [];
    
    // For each order, get its items
    const ordersWithItems: OrderWithItems[] = await Promise.all(
      orders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*, product:product_id(*)')
          .eq('order_id', order.id);
        
        if (itemsError) throw itemsError;
        
        return {
          ...order,
          items: items || []
        };
      })
    );
    
    return ordersWithItems;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

// Get order details including items
export const getOrderById = async (orderId: string): Promise<{
  order: Order | null;
  items: OrderItem[];
}> => {
  try {
    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) throw orderError;
    
    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, product:products!inner(*)')
      .eq('order_id', orderId);
    
    if (itemsError) throw itemsError;
    
    return {
      order,
      items: items || []
    };
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return {
      order: null,
      items: []
    };
  }
};

// Create a new order
export const createOrder = async (
  userId: string,
  orderData: CreateOrderParams
): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> => {
  try {
    // Calculate total amount
    const totalAmount = orderData.products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    // Get product names for display in order history
    const productNames = orderData.products.map(p => p.name);
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          address_id: orderData.addressId,
          total_amount: totalAmount,
          payment_method: orderData.paymentMethod,
          products_name: productNames
        }
      ])
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    if (!order) {
      throw new Error('Failed to create order: No order was returned');
    }
    
    // Create order items
    const orderItems = orderData.products.map(product => ({
      order_id: order.id,
      product_id: product.id,
      quantity: product.quantity,
      price: product.price
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    // Decrease product stock for each product
    for (const product of orderData.products) {
      try {
        await supabase.rpc('decrease_product_stock', {
          product_id: product.id,
          quantity: product.quantity
        });
      } catch (stockError) {
        console.error('Error decreasing stock:', stockError);
        // Don't fail the entire order if this fails, but log it
      }
    }
    
    // Show a small toast notification for successful order
    toast("Order placed successfully", {
      description: `Order #${order.id.substring(0, 8)} confirmed`,
      duration: 2000,
      position: "bottom-center"
    });
    
    return {
      success: true,
      orderId: order.id
    };
  } catch (error: any) {
    console.error('Error creating order:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to create order'
    };
  }
};

// Update an order's status
export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<boolean> => {
  try {
    // Fix the Date type issue by converting to ISO string
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    
    if (error) throw error;
    
    toast("Order updated", {
      description: `Order status changed to ${status}`,
      duration: 2000,
      position: "bottom-center"
    });
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

// Add the cancelOrder function that's used in OrderDetails.tsx
export const cancelOrder = async (orderId: string): Promise<boolean> => {
  return await updateOrderStatus(orderId, 'Cancelled');
};

// Process payment for an order
export const processPayment = async (
  orderId: string,
  paymentDetails: {
    transactionId: string;
    amount: number;
  }
): Promise<void> => {
  try {
    // Here we would typically call a payment processing API
    // For now we'll just log the payment and update the order
    console.log(`Processing payment for order ${orderId}`, paymentDetails);
    
    // Update order status after successful payment
    await updateOrderStatus(orderId, 'Paid');
    
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};


import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Product = Database['public']['Tables']['products']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

export type OrderStatus = 'Processing' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

/**
 * Creates a new order with the provided details
 * @param addressId The ID of the delivery address
 * @param totalAmount The total order amount
 * @param paymentMethod The payment method used (cod, razorpay, etc.)
 * @param items Array of order items with product ID, quantity and price
 * @returns The created order ID
 */
export const createOrder = async (
  addressId: string,
  totalAmount: number,
  paymentMethod: string,
  items: { productId: string; quantity: number; price: number; product?: Product }[]
): Promise<{ orderId: string }> => {
  // Start a Supabase transaction by using a stored procedure
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Extract product names for the order
    const productNames = items.map(item => item.product?.name || '');
    
    // First create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.user.id,
        address_id: addressId,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        status: 'Processing',
        products_name: productNames
      })
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }
    
    // Then create the order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback would be ideal here, but Supabase doesn't support transactions in the JS client
      // We'll handle this manually by deleting the order
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }
    
    // Update product stock counts
    for (const item of items) {
      const { error: stockError } = await supabase.rpc('decrease_product_stock', {
        product_id: item.productId,
        quantity: item.quantity
      });
      
      if (stockError) {
        console.error('Error updating product stock:', stockError);
        // We don't want to fail the order if stock update fails, but we should log it
      }
    }
    
    return { orderId: order.id };
  } catch (error) {
    console.error('Error in order creation:', error);
    throw error;
  }
};

/**
 * Gets all orders for the current user
 * @returns Array of orders with items and product details
 */
export const getOrders = async (): Promise<OrderWithItems[]> => {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw ordersError;
    }
    
    // For each order, get the order items and join with product info
    const ordersWithItems: OrderWithItems[] = [];
    
    for (const order of orders) {
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('order_id', order.id);
      
      if (itemsError) {
        console.error(`Error fetching items for order ${order.id}:`, itemsError);
        continue; // Skip this order but continue with others
      }
      
      ordersWithItems.push({
        ...order,
        items: orderItems as any
      });
    }
    
    return ordersWithItems;
  } catch (error) {
    console.error('Error in getOrders:', error);
    throw error;
  }
};

/**
 * Gets a single order by ID with all its items and products
 * @param id Order ID
 * @returns The order with its items and product details
 */
export const getOrderById = async (id: string): Promise<OrderWithItems> => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (orderError) {
      console.error(`Error fetching order with id ${id}:`, orderError);
      throw orderError;
    }
    
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    // Get the order items and join with product info
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('order_id', id);
    
    if (itemsError) {
      console.error(`Error fetching items for order ${id}:`, itemsError);
      throw itemsError;
    }
    
    return {
      ...order,
      items: orderItems as any
    } as OrderWithItems;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    throw error;
  }
};

/**
 * Updates the status of an order
 * @param id Order ID
 * @param status New order status
 * @returns Updated order
 */
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating order status for order ${id}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    throw error;
  }
};

/**
 * Cancels an order
 * @param id Order ID
 * @returns Updated order
 */
export const cancelOrder = async (id: string): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'Cancelled', 
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    throw error;
  }
};

/**
 * Process order payment once completed
 * @param orderId Order ID to process payment for
 * @param paymentDetails Additional payment details
 */
export const processOrderPayment = async (
  orderId: string, 
  paymentDetails: { 
    transactionId: string;
    amount: number; 
  }
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('process_payment', {
      p_order_id: orderId,
      p_transaction_id: paymentDetails.transactionId,
      p_amount: paymentDetails.amount
    });
    
    if (error) {
      console.error(`Error processing payment for order ${orderId}:`, error);
      throw error;
    }
  } catch (error) {
    console.error('Error in processOrderPayment:', error);
    throw error;
  }
};

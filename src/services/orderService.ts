
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/sonner';
import type { OrderStatus } from "@/types";
import type { Address } from "./addressService";

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface OrderDetails {
  user_id: string;
  address_id: string;
  payment_method: string;
  total_amount: number;
  platform_fees?: number;
  discount_amount?: number;
  applied_coupon_id?: string;
  products_name: string[];
  items: OrderItem[];
}

// Place an order
export const placeOrder = async (orderDetails: OrderDetails) => {
  const { user_id, address_id, payment_method, total_amount, products_name, items } = orderDetails;

  try {
    // Create the order in the database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id,
        address_id,
        payment_method,
        total_amount,
        status: 'Processing',
        products_name,
        order_date: new Date().toISOString()
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    if (!order) {
      throw new Error('Failed to create order');
    }

    const orderId = order.id;
    
    // Create order items
    const orderItems = items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      price: item.price,
      quantity: item.quantity
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }

    // Update product stock and popular products
    for (const item of items) {
      try {
        // Call the database function to decrease stock
        const { error: stockError } = await supabase.rpc('decrease_product_stock', {
          product_id: item.product_id,
          quantity: item.quantity
        });

        if (stockError) {
          console.error(`Error updating stock for product ${item.product_id}:`, stockError);
          toast(`Stock update error: ${stockError.message}`);
        }
      } catch (err) {
        console.error(`Error updating product ${item.product_id}:`, err);
      }
    }

    return { order, orderId };
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// Create order function specifically for Payment.tsx - UPDATED VERSION
export const createOrder = async (orderData: {
  addressId: string;
  userId: string;
  paymentMethod: string;
  totalAmount: number;
  platformFees?: number;
  discountAmount?: number;
  appliedCouponId?: string;
  products: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  try {
    console.log('Creating order with data:', orderData);
    
    if (!orderData || !orderData.products || !Array.isArray(orderData.products)) {
      throw new Error('Invalid order data: products array is missing or invalid');
    }

    // Create the order in the database with corrected structure
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.userId,
        address_id: orderData.addressId,
        payment_method: orderData.paymentMethod,
        total_amount: orderData.totalAmount,
        platform_fees: orderData.platformFees || 5.00,
        discount_amount: orderData.discountAmount || 0.00,
        applied_coupon_id: orderData.appliedCouponId || null,
        status: 'Processing',
        products_name: orderData.products.map(p => p.name),
        order_date: new Date().toISOString()
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }
    
    if (!order) {
      throw new Error('Failed to create order');
    }
    
    const orderId = order.id;
    console.log('Order created with ID:', orderId);
    
    // Create order items
    const orderItems = orderData.products.map(product => ({
      order_id: orderId,
      product_id: product.productId,
      price: product.price,
      quantity: product.quantity
    }));
    
    console.log('Creating order items:', orderItems);
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      throw itemsError;
    }
    
    console.log('Order items created successfully');
    
    // Update product stock quantities
    for (const product of orderData.products) {
      try {
        console.log(`Updating stock for product ${product.productId}, reducing by ${product.quantity}`);
        
        const { error: stockError } = await supabase.rpc('decrease_product_stock', {
          product_id: product.productId,
          quantity: product.quantity
        });

        if (stockError) {
          console.error(`Error updating stock for product ${product.productId}:`, stockError);
          toast(`Stock update error: ${stockError.message}`);
        } else {
          console.log(`Stock updated successfully for product ${product.productId}`);
        }
      } catch (err) {
        console.error(`Error updating product ${product.productId}:`, err);
      }
    }
    
    console.log('Order creation completed successfully');
    return { success: true, orderId };
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
};

// Get orders for a user
export const getUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*),
      address:address_id(*)
    `)
    .eq('user_id', userId)
    .order('order_date', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }

  return data;
};

// Get a specific order by ID
export const getOrderById = async (orderId: string) => {
  try {
    // Get the order with address information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        address:address_id(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error(`Error fetching order ${orderId}:`, orderError);
      throw orderError;
    }

    // Get the order items with product details
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:product_id (*)
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      console.error(`Error fetching items for order ${orderId}:`, itemsError);
      throw itemsError;
    }

    return { order, items: items || [] };
  } catch (error) {
    console.error(`Error in getOrderById for ${orderId}:`, error);
    throw error;
  }
};

// Cancel an order and restore product stock
export const cancelOrder = async (orderId: string) => {
  try {
    // First, get the order items to know what products to restore stock for
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      console.error(`Error fetching items for order ${orderId}:`, itemsError);
      throw itemsError;
    }

    // Update order status to Cancelled
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'Cancelled',
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw error;
    }

    // Restore stock for each product
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        try {
          // Call the database function to increase stock
          const { error: stockError } = await supabase.rpc('increase_product_stock', {
            product_id: item.product_id,
            quantity: item.quantity
          });

          if (stockError) {
            console.error(`Error restoring stock for product ${item.product_id}:`, stockError);
            toast(`Stock restoration error: ${stockError.message}`);
          }
        } catch (err) {
          console.error(`Error restoring stock for product ${item.product_id}:`, err);
        }
      }
    }

    return data;
  } catch (error) {
    console.error(`Error in cancelOrder for ${orderId}:`, error);
    throw error;
  }
};

// Return an order
export const returnOrder = async (orderId: string, reason: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      status: 'Return Requested',
      updated_at: new Date().toISOString(),
      metadata: { return_reason: reason } 
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error(`Error requesting return for order ${orderId}:`, error);
    throw error;
  }

  return data;
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      status,
      updated_at: new Date().toISOString() 
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }

  // If status is changed to Cancelled, restore stock
  if (status === 'Cancelled') {
    try {
      // Get order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);
        
      if (orderItems && orderItems.length > 0) {
        // Restore stock for each product
        for (const item of orderItems) {
          await supabase.rpc('increase_product_stock', {
            product_id: item.product_id,
            quantity: item.quantity
          });
        }
      }
    } catch (err) {
      console.error('Error restoring stock after cancellation:', err);
    }
  }

  return data;
};

// Add function to get addresses with order history
export const getAddressesWithOrderHistory = async () => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    throw new Error("User not authenticated");
  }
  
  const userId = userData.user.id;
  
  const { data, error } = await supabase
    .from('addresses')
    .select(`
      *,
      orders:id(count)
    `)
    .eq('user_id', userId)
    .eq('archived', false)
    .order('is_default', { ascending: false });
  
  if (error) {
    console.error('Error fetching addresses with order history:', error);
    throw error;
  }
  
  return data;
};

// Function to check if address is used in any orders
export const isAddressUsedInOrders = async (addressId: string) => {
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('address_id', addressId);
  
  if (error) {
    console.error(`Error checking if address ${addressId} is used in orders:`, error);
    throw error;
  }
  
  return count > 0;
};


/**
 * Subscribe to real-time updates for a specific order
 * @param orderId The ID of the order to subscribe to
 * @param callback Function to call when the order is updated
 * @returns A subscription object that can be used to unsubscribe
 */
export const subscribeToOrderUpdates = (orderId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `id=eq.${orderId}`
    }, callback)
    .subscribe();
};

/**
 * Subscribe to real-time updates for all orders of a user
 * @param userId The ID of the user
 * @param callback Function to call when any of the user's orders are updated
 * @returns A subscription object that can be used to unsubscribe
 */
export const subscribeToUserOrdersUpdates = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`user-orders-${userId}`)
    .on('postgres_changes', {
      event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'orders',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
};

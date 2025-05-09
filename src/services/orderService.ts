
import { supabase } from "@/integrations/supabase/client";
import { decrementProductStock, updatePopularProduct } from "./productService";

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
  products_name: string[];
  items: OrderItem[];
}

// Define OrderStatus type that's being imported in OrderDetails.tsx
export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested';

// Place an order
export const placeOrder = async (orderDetails: OrderDetails) => {
  const { user_id, address_id, payment_method, total_amount, products_name, items } = orderDetails;

  try {
    // Start a transaction for order creation
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id,
        address_id,
        payment_method,
        total_amount,
        products_name,
        status: 'Processing'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // Insert order items
    const orderItemsToInsert = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
      throw itemsError;
    }

    // Update product stock and popular products
    for (const item of items) {
      try {
        // Update stock
        await decrementProductStock(item.product_id, item.quantity);
        
        // Update popular products
        await updatePopularProduct(item.product_id, item.quantity);
      } catch (err) {
        console.error(`Error updating product ${item.product_id}:`, err);
        // We don't want to fail the order if stock update fails
        // But we log the error for monitoring
      }
    }

    return order;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// Create order function specifically for Payment.tsx
export const createOrder = async (userId: string, orderData: {
  addressId: string;
  products: { id: string; name: string; price: number; quantity: number }[];
  paymentMethod: string;
}) => {
  try {
    // Calculate total amount
    const totalAmount = orderData.products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);

    // Prepare order details
    const orderDetails: OrderDetails = {
      user_id: userId,
      address_id: orderData.addressId,
      payment_method: orderData.paymentMethod,
      total_amount: totalAmount,
      products_name: orderData.products.map(p => p.name),
      items: orderData.products.map(p => ({
        product_id: p.id,
        quantity: p.quantity,
        price: p.price
      }))
    };

    // Place the order
    const order = await placeOrder(orderDetails);
    
    return {
      orderId: order.id,
      totalAmount: order.total_amount,
      status: order.status
    };
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
      order_items(*)
    `)
    .eq('user_id', userId)
    .order('order_date', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }

  return data;
};

// Get a specific order by ID - needed for OrderDetails.tsx
export const getOrderById = async (orderId: string) => {
  try {
    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error(`Error fetching order ${orderId}:`, orderError);
      throw orderError;
    }

    // Get the order items
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

// Cancel an order
export const cancelOrder = async (orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'Cancelled' })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
    throw error;
  }

  return data;
};

// Return an order
export const returnOrder = async (orderId: string, reason: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      status: 'Return Requested',
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

// Update order status - needed for OrderDetails.tsx
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }

  return data;
};

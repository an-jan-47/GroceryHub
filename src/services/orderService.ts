
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Product } from "./productService";

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

export const createOrder = async (
  addressId: string,
  totalAmount: number,
  paymentMethod: string,
  items: { productId: string; quantity: number; price: number }[]
) => {
  // Start a Supabase transaction by using a stored procedure
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }
  
  // First create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.user.id,
      address_id: addressId,
      total_amount: totalAmount,
      payment_method: paymentMethod
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
  
  return { orderId: order.id };
};

export const getOrders = async () => {
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
};

export const getOrderById = async (id: string) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (orderError) {
    console.error(`Error fetching order with id ${id}:`, orderError);
    throw orderError;
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
};

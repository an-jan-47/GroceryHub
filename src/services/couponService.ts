
import { supabase } from "@/integrations/supabase/client";

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  min_purchase_amount: number;
  max_discount_amount?: number;
  start_date: string;
  expiry_date: string;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
  applicable_products?: string[];
  applicable_categories?: string[];
}

export const getActiveCoupons = async (limit?: number) => {
  let query = supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString())
    .gte('expiry_date', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }

  return data as Coupon[];
};

export const validateCoupon = async (code: string, cartTotal: number) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error('Invalid or expired coupon code');
  }

  const coupon = data as Coupon;
  
  // Check if coupon is still valid
  const now = new Date();
  const startDate = new Date(coupon.start_date);
  const expiryDate = new Date(coupon.expiry_date);
  
  if (now < startDate || now > expiryDate) {
    throw new Error('Coupon has expired or is not yet active');
  }

  // Check usage limit
  if (coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
    throw new Error('Coupon usage limit exceeded');
  }

  // Check minimum purchase amount
  if (cartTotal < coupon.min_purchase_amount) {
    throw new Error(`Minimum purchase amount of ₹${coupon.min_purchase_amount} required`);
  }

  return coupon;
};

export const calculateDiscount = (coupon: Coupon, cartTotal: number): number => {
  let discount = 0;

  if (coupon.type === 'percentage') {
    discount = (cartTotal * coupon.value) / 100;
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
  }

  // Apply maximum discount limit if specified
  if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
    discount = coupon.max_discount_amount;
  }

  return Math.min(discount, cartTotal);
};

export const applyCoupon = async (couponId: string, orderId: string, discountAmount: number) => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from('coupon_usage')
    .insert({
      user_id: userData.user.id,
      coupon_id: couponId,
      order_id: orderId,
      discount_amount: discountAmount
    });

  if (error) {
    console.error('Error recording coupon usage:', error);
    throw error;
  }

  // Update coupon usage count using the RPC function
  const { error: updateError } = await supabase.rpc('increment_coupon_usage', {
    coupon_id: couponId
  });

  if (updateError) {
    console.error('Error updating coupon usage count:', updateError);
  }
};


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
  can_stack?: boolean; // New field to determine if coupon can be stacked with others
}

export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
  appliedToTotal: number; // Track the total when coupon was applied
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

export const getCouponById = async (couponId: string) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', couponId)
    .single();

  if (error) {
    console.error('Error fetching coupon by ID:', error);
    throw error;
  }

  return data as Coupon;
};

export const validateCoupon = async (code: string, cartTotal: number, appliedCoupons: AppliedCoupon[] = []) => {
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
  
  // Check if coupon is already applied
  const isAlreadyApplied = appliedCoupons.some(applied => applied.coupon.code === coupon.code);
  if (isAlreadyApplied) {
    throw new Error('This coupon is already applied');
  }
  
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

  // Check if coupon can be stacked (if field exists, default to true for backward compatibility)
  const canStack = coupon.can_stack !== false;
  if (!canStack && appliedCoupons.length > 0) {
    throw new Error('This coupon cannot be combined with other coupons');
  }

  // Check if any existing coupons prevent stacking
  const hasNonStackableCoupon = appliedCoupons.some(applied => applied.coupon.can_stack === false);
  if (hasNonStackableCoupon) {
    throw new Error('Cannot add more coupons when a non-stackable coupon is applied');
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

export const calculateMultipleCouponsDiscount = (coupons: Coupon[], cartTotal: number): AppliedCoupon[] => {
  const appliedCoupons: AppliedCoupon[] = [];
  let remainingTotal = cartTotal;

  // Sort coupons by priority (fixed amount first, then percentage)
  const sortedCoupons = [...coupons].sort((a, b) => {
    if (a.type === 'fixed' && b.type === 'percentage') return -1;
    if (a.type === 'percentage' && b.type === 'fixed') return 1;
    return b.value - a.value; // Higher value first within same type
  });

  for (const coupon of sortedCoupons) {
    if (remainingTotal <= 0) break;

    const discount = calculateDiscount(coupon, remainingTotal);
    if (discount > 0) {
      appliedCoupons.push({
        coupon,
        discountAmount: discount,
        appliedToTotal: remainingTotal
      });
      remainingTotal -= discount;
    }
  }

  return appliedCoupons;
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

export const applyMultipleCoupons = async (appliedCoupons: AppliedCoupon[], orderId: string) => {
  const promises = appliedCoupons.map(applied => 
    applyCoupon(applied.coupon.id, orderId, applied.discountAmount)
  );
  
  await Promise.all(promises);
};

export const formatCouponForDisplay = (coupon: Coupon) => {
  const now = new Date();
  const expiryDate = new Date(coupon.expiry_date);
  const isExpired = now > expiryDate;
  
  return {
    ...coupon,
    isExpired,
    formattedDiscount: coupon.type === 'percentage' 
      ? `${coupon.value}% OFF` 
      : `₹${coupon.value} OFF`,
    formattedMinPurchase: `Min. purchase ₹${coupon.min_purchase_amount}`,
    formattedExpiry: expiryDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    usageText: coupon.usage_limit > 0 
      ? `${coupon.usage_count}/${coupon.usage_limit} used` 
      : `${coupon.usage_count} used`,
    maxDiscountText: coupon.max_discount_amount 
      ? `Max discount ₹${coupon.max_discount_amount}` 
      : null
  };
};

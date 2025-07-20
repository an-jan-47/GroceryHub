
import { supabase } from '@/integrations/supabase/client';

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_purchase_amount: number;
  max_discount_amount?: number;
  is_active: boolean;
  start_date: string;
  expiry_date: string;
  usage_limit: number;
  usage_count: number;
  applicable_products?: string[];
  applicable_categories?: string[];
  description?: string;
}

export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
  appliedToTotal: number;
  applicableProducts: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  applicable_coupons?: string[];
}

export const getCouponById = async (couponId: string): Promise<Coupon | null> => {
  try {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      console.error('Error fetching coupon:', error);
      return null;
    }

    return coupon;
  } catch (error) {
    console.error('Error in getCouponById:', error);
    return null;
  }
};

export const formatCouponForDisplay = (coupon: Coupon) => {
  const formattedDiscount = coupon.type === 'percentage' 
    ? `${coupon.value}% OFF`
    : `₹${coupon.value} OFF`;
  
  const formattedMinPurchase = `Min. purchase: ₹${coupon.min_purchase_amount}`;
  
  return {
    formattedDiscount,
    formattedMinPurchase
  };
};

export const validateCoupon = async (
  couponCode: string,
  cartTotal: number,
  appliedCoupons: AppliedCoupon[],
  cartItems: CartItem[]
): Promise<Coupon> => {
  console.log('Validating coupon:', couponCode);
  console.log('Cart items for validation:', cartItems);

  // Fetch the coupon from database
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', couponCode.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !coupon) {
    console.error('Coupon fetch error:', error);
    throw new Error('Invalid or expired coupon code');
  }

  console.log('Fetched coupon:', coupon);

  // Check if coupon is already applied
  const isAlreadyApplied = appliedCoupons.some(ac => ac.coupon.id === coupon.id);
  if (isAlreadyApplied) {
    throw new Error('This coupon has already been applied');
  }

  // Check date validity
  const now = new Date();
  const startDate = new Date(coupon.start_date);
  const expiryDate = new Date(coupon.expiry_date);
  
  if (now < startDate || now > expiryDate) {
    throw new Error('This coupon has expired or is not yet valid');
  }

  // Check usage limit
  if (coupon.usage_count >= coupon.usage_limit) {
    throw new Error('This coupon has reached its usage limit');
  }

  // Find eligible products in cart based on coupon's applicable_products
  const eligibleProducts = cartItems.filter(item => {
    if (coupon.applicable_products && Array.isArray(coupon.applicable_products)) {
      const isEligible = coupon.applicable_products.includes(item.id);
      console.log(`Product ${item.name} (${item.id}) eligible:`, isEligible);
      return isEligible;
    }
    return false;
  });

  console.log('Eligible products for coupon:', eligibleProducts);

  if (eligibleProducts.length === 0) {
    throw new Error('This coupon is not applicable to any products in your cart');
  }

  // Calculate total value of eligible products only
  const eligibleProductsTotal = eligibleProducts.reduce((total, item) => {
    const itemPrice = Number(item.salePrice || item.price);
    const quantity = Number(item.quantity);
    const itemTotal = itemPrice * quantity;
    console.log(`Item ${item.name}: price=${itemPrice}, quantity=${quantity}, total=${itemTotal}`);
    return total + itemTotal;
  }, 0);

  console.log('Eligible products total:', eligibleProductsTotal);
  console.log('Required minimum:', coupon.min_purchase_amount);

  // Check minimum purchase amount for eligible products only
  if (eligibleProductsTotal < Number(coupon.min_purchase_amount)) {
    throw new Error(`Minimum purchase amount of ₹${coupon.min_purchase_amount} required for eligible products. Current eligible products total: ₹${eligibleProductsTotal.toFixed(2)}`);
  }

  return coupon;
};

export const calculateDiscount = (
  coupon: Coupon,
  cartTotal: number,
  cartItems: CartItem[]
): { discountAmount: number; applicableProducts: string[] } => {
  console.log('Calculating discount for coupon:', coupon.code);
  
  // Find eligible products based on coupon's applicable_products
  const eligibleProducts = cartItems.filter(item => {
    if (coupon.applicable_products && Array.isArray(coupon.applicable_products)) {
      return coupon.applicable_products.includes(item.id);
    }
    return false;
  });

  const applicableProductIds = eligibleProducts.map(item => item.id);

  // Calculate total value of eligible products
  const eligibleTotal = eligibleProducts.reduce((total, item) => {
    const itemPrice = Number(item.salePrice || item.price);
    const quantity = Number(item.quantity);
    return total + (itemPrice * quantity);
  }, 0);

  console.log('Eligible products total for discount calculation:', eligibleTotal);

  let discountAmount = 0;

  if (coupon.type === 'percentage') {
    discountAmount = (eligibleTotal * Number(coupon.value)) / 100;
    
    // Apply max discount limit if specified
    if (coupon.max_discount_amount && discountAmount > Number(coupon.max_discount_amount)) {
      discountAmount = Number(coupon.max_discount_amount);
    }
  } else if (coupon.type === 'fixed') {
    discountAmount = Math.min(Number(coupon.value), eligibleTotal);
  }

  console.log('Calculated discount amount:', discountAmount);

  return {
    discountAmount: Number(discountAmount.toFixed(2)),
    applicableProducts: applicableProductIds
  };
};

export const getItemDiscount = (
  item: CartItem,
  appliedCoupons: AppliedCoupon[]
): { totalDiscount: number; discountPercentage: number } => {
  let totalDiscount = 0;
  let maxDiscountPercentage = 0;

  const itemPrice = Number(item.salePrice || item.price);
  const itemTotal = itemPrice * Number(item.quantity);

  appliedCoupons.forEach(({ coupon, discountAmount, applicableProducts }) => {
    // Check if this item is eligible for this coupon
    if (!applicableProducts.includes(item.id)) {
      return;
    }

    // Calculate proportional discount for this item
    let itemDiscount = 0;

    if (coupon.type === 'percentage') {
      itemDiscount = (itemTotal * Number(coupon.value)) / 100;
      
      // Apply max discount limit if specified
      if (coupon.max_discount_amount) {
        const maxItemDiscount = Math.min(itemDiscount, Number(coupon.max_discount_amount));
        itemDiscount = maxItemDiscount;
      }
      
      maxDiscountPercentage = Math.max(maxDiscountPercentage, Number(coupon.value));
    } else if (coupon.type === 'fixed') {
      // For fixed discount, we need to calculate the proportion
      // This is a simplified approach - in reality you'd need all eligible items
      itemDiscount = Math.min(Number(discountAmount), itemTotal);
      
      const effectivePercentage = (itemDiscount / itemTotal) * 100;
      maxDiscountPercentage = Math.max(maxDiscountPercentage, effectivePercentage);
    }

    totalDiscount += itemDiscount;
  });

  return {
    totalDiscount: Number(totalDiscount.toFixed(2)),
    discountPercentage: Math.round(maxDiscountPercentage)
  };
};

// Helper function to get active coupons
export const getActiveCoupons = async (limit?: number): Promise<Coupon[]> => {
  try {
    let query = supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .gte('expiry_date', new Date().toISOString())
      .order('value', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    return [];
  }
};


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
  console.log('Cart items:', cartItems);

  // Fetch the coupon from database
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', couponCode.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !coupon) {
    throw new Error('Invalid or expired coupon code');
  }

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

  // Fetch products data to get their applicable_coupons
  const productIds = cartItems.map(item => item.id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, applicable_coupons')
    .in('id', productIds);

  if (productsError) {
    console.error('Error fetching products:', productsError);
    throw new Error('Error validating coupon eligibility');
  }

  // Find eligible products in cart that have this coupon in their applicable_coupons array
  const eligibleProducts = cartItems.filter(item => {
    const productData = products.find(p => p.id === item.id);
    const itemApplicableCoupons = productData?.applicable_coupons || [];
    return itemApplicableCoupons.includes(couponCode.toUpperCase());
  });

  console.log('Eligible products for coupon:', eligibleProducts);

  if (eligibleProducts.length === 0) {
    throw new Error('This coupon is not applicable to any products in your cart');
  }

  // Calculate total value of eligible products
  const eligibleProductsTotal = eligibleProducts.reduce((total, item) => {
    const itemPrice = item.salePrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  console.log('Eligible products total:', eligibleProductsTotal);
  console.log('Required minimum:', coupon.min_purchase_amount);

  // Check minimum purchase amount for eligible products only
  if (eligibleProductsTotal < coupon.min_purchase_amount) {
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
  
  // Find eligible products that have this coupon in their applicable_coupons array
  const eligibleProducts = cartItems.filter(item => {
    const itemApplicableCoupons = item.applicable_coupons || [];
    return itemApplicableCoupons.includes(coupon.code);
  });

  const applicableProductIds = eligibleProducts.map(item => item.id);

  // Calculate total value of eligible products
  const eligibleTotal = eligibleProducts.reduce((total, item) => {
    const itemPrice = item.salePrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  console.log('Eligible products total for discount calculation:', eligibleTotal);

  let discountAmount = 0;

  if (coupon.type === 'percentage') {
    discountAmount = (eligibleTotal * coupon.value) / 100;
    
    // Apply max discount limit if specified
    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
      discountAmount = coupon.max_discount_amount;
    }
  } else if (coupon.type === 'fixed') {
    discountAmount = Math.min(coupon.value, eligibleTotal);
  }

  console.log('Calculated discount amount:', discountAmount);

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    applicableProducts: applicableProductIds
  };
};

export const getItemDiscount = (
  item: CartItem,
  appliedCoupons: AppliedCoupon[]
): { totalDiscount: number; discountPercentage: number } => {
  let totalDiscount = 0;
  let maxDiscountPercentage = 0;

  const itemPrice = item.salePrice || item.price;
  const itemTotal = itemPrice * item.quantity;

  appliedCoupons.forEach(({ coupon, discountAmount, applicableProducts }) => {
    // Check if this item is eligible for this coupon
    if (!applicableProducts.includes(item.id)) {
      return;
    }

    // Calculate all eligible items total for this coupon
    const eligibleItemsTotal = applicableProducts.reduce((total, productId) => {
      // Find the cart item
      const cartItem = item.id === productId ? item : null;
      if (!cartItem) return total;
      
      const price = cartItem.salePrice || cartItem.price;
      return total + (price * cartItem.quantity);
    }, 0);

    if (eligibleItemsTotal === 0) return;

    let itemDiscount = 0;

    if (coupon.type === 'percentage') {
      itemDiscount = (itemTotal * coupon.value) / 100;
      
      // Apply max discount limit proportionally
      if (coupon.max_discount_amount) {
        const maxItemDiscount = (coupon.max_discount_amount * itemTotal) / eligibleItemsTotal;
        itemDiscount = Math.min(itemDiscount, maxItemDiscount);
      }
      
      maxDiscountPercentage = Math.max(maxDiscountPercentage, coupon.value);
    } else if (coupon.type === 'fixed') {
      // Distribute fixed discount proportionally
      const itemShare = itemTotal / eligibleItemsTotal;
      itemDiscount = discountAmount * itemShare;
      
      const effectivePercentage = (itemDiscount / itemTotal) * 100;
      maxDiscountPercentage = Math.max(maxDiscountPercentage, effectivePercentage);
    }

    totalDiscount += itemDiscount;
  });

  return {
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    discountPercentage: Math.round(maxDiscountPercentage)
  };
};

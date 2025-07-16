
import { supabase } from "@/integrations/supabase/client";
import type { Coupon } from '@/services/couponService';
import type { CartItem } from '@/hooks/useCart';

export interface ProductSpecificDiscount {
  productId: string;
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  discountPercentage: number;
}

export interface CouponApplicationResult {
  success: boolean;
  message: string;
  productDiscounts: ProductSpecificDiscount[];
  totalDiscount: number;
  eligibleProductsTotal: number;
}

export const validateAndApplyProductSpecificCoupon = async (
  couponCode: string,
  cartItems: CartItem[]
): Promise<CouponApplicationResult> => {
  try {
    // Fetch coupon details
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .gte('expiry_date', new Date().toISOString())
      .single();

    if (error || !coupon) {
      return {
        success: false,
        message: 'Invalid or expired coupon code',
        productDiscounts: [],
        totalDiscount: 0,
        eligibleProductsTotal: 0
      };
    }

    // Fetch product details to get applicable_coupons for each cart item
    const cartProductIds = cartItems.map(item => item.id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, applicable_coupons')
      .in('id', cartProductIds);

    if (productsError) {
      return {
        success: false,
        message: 'Error validating products',
        productDiscounts: [],
        totalDiscount: 0,
        eligibleProductsTotal: 0
      };
    }

    // Create a map of product ID to applicable coupons
    const productCouponsMap = new Map<string, string[]>(
      products?.map((p: any) => [p.id, p.applicable_coupons || []]) || []
    );

    // Find eligible products in cart - must have the coupon in their applicable_coupons array
    const eligibleProducts = cartItems.filter(item => {
      const productApplicableCoupons: string[] = productCouponsMap.get(item.id) || [];
      
      // First check if the product has this coupon in its applicable_coupons array
      if (!productApplicableCoupons.includes(couponCode.toUpperCase())) {
        return false;
      }
      
      // Additional validation: Check if product is specifically listed in coupon's applicable_products
      if (coupon.applicable_products && coupon.applicable_products.length > 0) {
        if (!coupon.applicable_products.includes(item.id)) {
          return false;
        }
      }
      
      // Additional validation: Check if product category is in coupon's applicable_categories
      if (coupon.applicable_categories && coupon.applicable_categories.length > 0) {
        if (!coupon.applicable_categories.includes(item.category)) {
          return false;
        }
      }
      
      return true;
    });

    if (eligibleProducts.length === 0) {
      return {
        success: false,
        message: 'This coupon is not applicable to any items in your cart',
        productDiscounts: [],
        totalDiscount: 0,
        eligibleProductsTotal: 0
      };
    }

    // Calculate total value of eligible products
    const eligibleProductsTotal = eligibleProducts.reduce((total, item) => {
      const itemPrice = item.salePrice || item.price;
      return total + (itemPrice * item.quantity);
    }, 0);

    // Check minimum purchase amount for eligible products only
    if (eligibleProductsTotal < coupon.min_purchase_amount) {
      return {
        success: false,
        message: `Minimum purchase amount of ₹${coupon.min_purchase_amount} required for eligible products. Current eligible products total: ₹${eligibleProductsTotal.toFixed(2)}`,
        productDiscounts: [],
        totalDiscount: 0,
        eligibleProductsTotal
      };
    }

    // Calculate discounts for each eligible product
    const productDiscounts: ProductSpecificDiscount[] = [];
    let totalDiscount = 0;

    for (const item of eligibleProducts) {
      const itemPrice = item.salePrice || item.price;
      const itemTotal = itemPrice * item.quantity;
      
      let itemDiscount = 0;
      
      if (coupon.type === 'percentage') {
        itemDiscount = (itemTotal * coupon.value) / 100;
      } else if (coupon.type === 'fixed') {
        // For fixed discounts, distribute proportionally based on item value
        const proportion = itemTotal / eligibleProductsTotal;
        itemDiscount = coupon.value * proportion;
      }

      // Apply max discount limit if specified
      if (coupon.max_discount_amount) {
        const maxDiscountForItem = (itemTotal / eligibleProductsTotal) * coupon.max_discount_amount;
        itemDiscount = Math.min(itemDiscount, maxDiscountForItem);
      }

      // Ensure discount doesn't exceed item total
      itemDiscount = Math.min(itemDiscount, itemTotal);

      if (itemDiscount > 0) {
        const discountedPrice = itemPrice - (itemDiscount / item.quantity);
        const discountPercentage = (itemDiscount / itemTotal) * 100;

        productDiscounts.push({
          productId: item.id,
          originalPrice: itemPrice,
          discountedPrice,
          discountAmount: itemDiscount,
          discountPercentage
        });

        totalDiscount += itemDiscount;
      }
    }

    return {
      success: true,
      message: `Coupon applied successfully! ₹${totalDiscount.toFixed(2)} discount on ${eligibleProducts.length} product(s).`,
      productDiscounts,
      totalDiscount,
      eligibleProductsTotal
    };

  } catch (error) {
    console.error('Error validating coupon:', error);
    return {
      success: false,
      message: 'Error applying coupon. Please try again.',
      productDiscounts: [],
      totalDiscount: 0,
      eligibleProductsTotal: 0
    };
  }
};

export const getProductDiscount = (productId: string, appliedDiscounts: ProductSpecificDiscount[]): ProductSpecificDiscount | null => {
  return appliedDiscounts.find(discount => discount.productId === productId) || null;
};

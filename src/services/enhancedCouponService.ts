
import { supabase } from "@/integrations/supabase/client";
import type { Coupon } from '@/types/coupon';
import type { CartItem } from '@/hooks/useCart';

export interface ProductCouponValidation {
  productId: string;
  isEligible: boolean;
  eligibleValue: number;
  discountAmount: number;
  reason?: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  eligibleProducts: ProductCouponValidation[];
  totalEligibleValue: number;
  totalDiscountAmount: number;
  reason?: string;
}

export const validateProductSpecificCoupon = async (
  coupon: Coupon, 
  cartItems: CartItem[]
): Promise<CouponValidationResult> => {
  try {
    // Filter products that are eligible for this coupon
    const eligibleProducts: ProductCouponValidation[] = [];
    let totalEligibleValue = 0;
    let totalDiscountAmount = 0;

    for (const item of cartItems) {
      let isEligible = false;
      const itemPrice = item.salePrice || item.price;
      const itemTotal = itemPrice * item.quantity;

      // Check if product is directly applicable
      if (coupon.applicable_products && coupon.applicable_products.includes(item.id)) {
        isEligible = true;
      }
      
      // Check if product category is applicable
      if (coupon.applicable_categories && coupon.applicable_categories.includes(item.category)) {
        isEligible = true;
      }

      // Check if product has this coupon in its applicable_coupons array
      if (item.applicableCoupons && item.applicableCoupons.includes(coupon.id)) {
        isEligible = true;
      }

      if (isEligible) {
        const discountAmount = calculateProductDiscount(coupon, itemTotal);
        eligibleProducts.push({
          productId: item.id,
          isEligible: true,
          eligibleValue: itemTotal,
          discountAmount
        });
        totalEligibleValue += itemTotal;
        totalDiscountAmount += discountAmount;
      } else {
        eligibleProducts.push({
          productId: item.id,
          isEligible: false,
          eligibleValue: 0,
          discountAmount: 0,
          reason: 'Product not eligible for this coupon'
        });
      }
    }

    // Check if minimum purchase amount is met for eligible products
    if (totalEligibleValue < coupon.min_purchase_amount) {
      return {
        isValid: false,
        eligibleProducts,
        totalEligibleValue,
        totalDiscountAmount: 0,
        reason: `Minimum purchase amount of ₹${coupon.min_purchase_amount} not met for eligible products. Current eligible total: ₹${totalEligibleValue.toFixed(2)}`
      };
    }

    // Check if any products are eligible
    if (eligibleProducts.every(p => !p.isEligible)) {
      return {
        isValid: false,
        eligibleProducts,
        totalEligibleValue: 0,
        totalDiscountAmount: 0,
        reason: 'No products in cart are eligible for this coupon'
      };
    }

    return {
      isValid: true,
      eligibleProducts,
      totalEligibleValue,
      totalDiscountAmount
    };

  } catch (error) {
    console.error('Error validating product-specific coupon:', error);
    return {
      isValid: false,
      eligibleProducts: [],
      totalEligibleValue: 0,
      totalDiscountAmount: 0,
      reason: 'Error validating coupon'
    };
  }
};

export const calculateProductDiscount = (coupon: Coupon, productValue: number): number => {
  let discount = 0;

  if (coupon.type === 'percentage') {
    discount = (productValue * coupon.value) / 100;
  } else if (coupon.type === 'fixed') {
    discount = Math.min(coupon.value, productValue);
  }

  // Apply maximum discount limit if specified
  if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
    discount = coupon.max_discount_amount;
  }

  return Math.min(discount, productValue);
};

export const applyProductSpecificDiscount = (
  cartItems: CartItem[],
  validationResult: CouponValidationResult
): CartItem[] => {
  return cartItems.map(item => {
    const productValidation = validationResult.eligibleProducts.find(p => p.productId === item.id);
    
    if (productValidation && productValidation.isEligible) {
      const itemPrice = item.salePrice || item.price;
      const discountPercentage = (productValidation.discountAmount / (itemPrice * item.quantity)) * 100;
      
      return {
        ...item,
        appliedDiscountAmount: productValidation.discountAmount / item.quantity,
        appliedDiscountPercentage: discountPercentage
      };
    }
    
    return item;
  });
};

export const getProductsWithCoupon = async (couponId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .contains('applicable_coupons', [couponId]);

  if (error) {
    console.error('Error fetching products with coupon:', error);
    return [];
  }

  return data || [];
};

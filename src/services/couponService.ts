
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_purchase_amount: number;
  max_discount_amount?: number;
  description?: string;
  is_active: boolean;
  expiry_date: string;
}

export function calculateDiscount(coupon: Coupon, cartTotal: number): number {
  if (cartTotal < coupon.min_purchase_amount) {
    return 0;
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (cartTotal * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
    discount = coupon.max_discount_amount;
  }

  return discount;
}

export async function validateCoupon(
  code: string, 
  cartTotal: number, 
  appliedCoupons: any[]
): Promise<boolean> {
  // Basic validation logic
  return true;
}

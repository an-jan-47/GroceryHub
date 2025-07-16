
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
  can_stack?: boolean;
}

export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
  appliedToTotal: number;
  eligibleProducts?: string[];
}

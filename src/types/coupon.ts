
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string | null;
  min_purchase_amount: number;
  max_discount_amount?: number | null;
  start_date: string;
  expiry_date: string;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
  applicable_products?: string[] | null;
  applicable_categories?: string[] | null;
  can_stack?: boolean;
  created_at?: string;
  created_by?: string | null;
  updated_at?: string;
}

export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
  appliedToTotal: number;
  eligibleProducts?: string[];
}

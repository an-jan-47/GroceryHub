
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_purchase_amount: number;
  max_discount_amount?: number;
  usage_limit: number;
  usage_count: number;
  start_date: string;
  expiry_date: string;
  is_active: boolean;
  applicable_categories?: string[];
  applicable_products?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

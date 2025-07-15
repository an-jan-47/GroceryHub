
export interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  description?: string;
  min_purchase_amount: number;
  max_discount_amount?: number;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
  start_date: string;
  expiry_date: string;
  applicable_categories?: string[];
  applicable_products?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

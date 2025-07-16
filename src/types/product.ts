
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number | null;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  rating: number;
  review_count: number;
  features?: any;
  gst_rate?: number | null;
  hsn_number?: string | null;
  applicable_coupons?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

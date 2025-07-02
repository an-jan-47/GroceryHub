
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

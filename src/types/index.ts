
export type OrderStatus = 
  | 'Processing'
  | 'Shipped' 
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested';

export interface Product {
  id: string;
  name: string;
  price: number;
  sale_price?: number;
  images: string[];
  rating: number;
  review_count: number;
  stock: number;
  category: string;
  brand: string;
  description: string;
  features?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  total_amount: number;
  order_date: string;
  status: OrderStatus;
  payment_method: string;
  payment_status?: string;
  products_name?: string[];
}

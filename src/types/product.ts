
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  stock?: number;
  rating?: number;
  review_count: number;
  features?: string[];
}

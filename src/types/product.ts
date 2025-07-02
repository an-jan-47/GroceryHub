
export interface Product {
  id: string;
  name: string;
  price: number;
  sale_price?: number;
  salePrice?: number;
  description?: string;
  images?: string[];
  category: string;
  brand?: string;
  rating: number;
  stock: number;
}

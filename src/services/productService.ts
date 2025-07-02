
import { supabase } from '@/integrations/supabase/client'

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sale_price?: number;
  images?: string[];
  brand?: string;
  category?: string;
  stock: number;
  rating: number;
  review_count: number;
  features?: string[];
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    throw error;
  }

  return (data || []).map((product: any) => ({
    ...product,
    features: product.features || [],
    review_count: product.review_count || 0,
  }));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(8);

  if (error) {
    throw error;
  }

  return (data || []).map((product: any) => ({
    ...product,
    features: product.features || [],
    review_count: product.review_count || 0,
  }));
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category);

  if (error) {
    throw error;
  }

  return (data || []).map((product: any) => ({
    ...product,
    features: product.features || [],
    review_count: product.review_count || 0,
  }));
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', `%${query}%`);

  if (error) {
    throw error;
  }

  return (data || []).map((product: any) => ({
    ...product,
    features: product.features || [],
    review_count: product.review_count || 0,
  }));
}

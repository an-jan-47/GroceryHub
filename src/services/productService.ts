
import { supabase } from '@/integrations/supabase/client'
import type { Product } from '@/types/product'

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

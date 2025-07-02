
import { supabase } from '@/integrations/supabase/client'
import type { Product } from '@/services/productService'

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function searchProducts(filters: SearchFilters = {}): Promise<Product[]> {
  let queryBuilder = supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (filters.query) {
    queryBuilder = queryBuilder.ilike('name', `%${filters.query}%`);
  }

  if (filters.category) {
    queryBuilder = queryBuilder.eq('category', filters.category);
  }

  if (filters.minPrice !== undefined) {
    queryBuilder = queryBuilder.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    queryBuilder = queryBuilder.lte('price', filters.maxPrice);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    throw error;
  }

  return (data || []).map((product: any) => ({
    ...product,
    review_count: product.review_count || 0,
  }));
}

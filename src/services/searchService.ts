
import { supabase } from '@/integrations/supabase/client'
import type { Product } from '@/types/product'

export async function searchProducts(
  query: string,
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}
): Promise<Product[]> {
  let queryBuilder = supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (query) {
    queryBuilder = queryBuilder.ilike('name', `%${query}%`);
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

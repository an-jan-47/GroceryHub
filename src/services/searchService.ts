
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

export const searchProducts = async (filters: SearchFilters): Promise<Product[]> => {
  let query = supabase
    .from('products')
    .select('*');

  // Apply search query filter
  if (filters.query) {
    query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }

  // Apply category filter
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  // Apply price range filter - check both price and sale_price
  if (filters.minPrice !== undefined) {
    // For minimum price, we need to check if sale_price exists and is >= minPrice
    // OR if there's no sale_price, then price should be >= minPrice
    query = query.or(`sale_price.gte.${filters.minPrice},and(sale_price.is.null,price.gte.${filters.minPrice})`);
  }
  
  if (filters.maxPrice !== undefined) {
    // For maximum price, we need to check if sale_price exists and is <= maxPrice
    // OR if there's no sale_price, then price should be <= maxPrice
    query = query.or(`sale_price.lte.${filters.maxPrice},and(sale_price.is.null,price.lte.${filters.maxPrice})`);
  }

  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        // Sort by sale_price if available, otherwise by price
        query = query.order('sale_price', { ascending: true, nullsLast: true })
                     .order('price', { ascending: true });
        break;
      case 'price-high':
        // Sort by sale_price if available, otherwise by price
        query = query.order('sale_price', { ascending: false, nullsFirst: true })
                     .order('price', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data || [];
};

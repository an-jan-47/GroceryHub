
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export interface SearchFilters {
  query?: string;
  category?: string;
  priceRange?: string;
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

  // Apply price range filter
  if (filters.priceRange) {
    switch (filters.priceRange) {
      case 'under-50':
        query = query.lt('price', 50);
        break;
      case '50-100':
        query = query.gte('price', 50).lte('price', 100);
        break;
      case '100-200':
        query = query.gt('price', 100).lte('price', 200);
        break;
      case 'over-200':
        query = query.gt('price', 200);
        break;
    }
  }

  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
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

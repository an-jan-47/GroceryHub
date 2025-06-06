
import { supabase } from "@/integrations/supabase/client";

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const searchProducts = async (filters: SearchFilters) => {
  let query = supabase
    .from('products')
    .select('*')
    .order('name');

  // Apply text search
  if (filters.query) {
    query = query.ilike('name', `%${filters.query}%`);
  }

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  // Apply price filters
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }

  // Convert features from Json to string[] to match Product type
  return data?.map(product => ({
    ...product,
    features: Array.isArray(product.features) ? product.features.map(f => String(f)) : []
  })) || [];
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
    
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  return data || [];
};

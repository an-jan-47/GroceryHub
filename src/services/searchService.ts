
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  minRating?: number;
  sortBy?: 'price' | 'rating' | 'name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export const searchProducts = async (filters: SearchFilters): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        features
      `);

    // Apply text search
    if (filters.query && filters.query.trim()) {
      query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,brand.ilike.%${filters.query}%`);
    }

    // Apply category filter
    if (filters.category && filters.category.trim()) {
      query = query.eq('category', filters.category);
    }

    // Apply price range filter
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    // Apply brand filter
    if (filters.brand && filters.brand.trim()) {
      query = query.eq('brand', filters.brand);
    }

    // Apply rating filter
    if (filters.minRating !== undefined) {
      query = query.gte('rating', filters.minRating);
    }

    // Apply sorting
    if (filters.sortBy) {
      const ascending = filters.sortOrder === 'asc';
      if (filters.sortBy === 'popularity') {
        // Sort by review count as proxy for popularity
        query = query.order('review_count', { ascending: !ascending });
      } else {
        query = query.order(filters.sortBy, { ascending });
      }
    } else {
      // Default sorting
      query = query.order('rating', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    return (data || []).map(product => ({
      ...product,
      features: Array.isArray(product.features) 
        ? product.features.filter((f: string) => f && f.trim() !== '')
        : []
    }));
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

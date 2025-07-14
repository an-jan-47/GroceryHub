import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

interface SearchOptions {
  query: string;
  category?: string;
  brand?: string;
  priceRange?: [number, number];
  minRating?: number;
}

export const searchProducts = async (options: SearchOptions): Promise<Product[]> => {
  const { query, category, brand, priceRange, minRating } = options;

  let searchQuery = `name.ilike.%${query}%,description.ilike.%${query}%`;

  if (category) {
    searchQuery += `,category.eq.${category}`;
  }

  if (brand) {
    searchQuery += `,brand.eq.${brand}`;
  }

  let priceQuery = '';
  if (priceRange) {
    priceQuery = `price.gte.${priceRange[0]},price.lte.${priceRange[1]}`;
  }

  if (priceQuery) {
    searchQuery += `,and(${priceQuery})`;
  }

  if (minRating) {
    searchQuery += `,rating.gte.${minRating}`;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(searchQuery)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data?.map(product => ({
    ...product,
    features: Array.isArray(product.features) ? product.features.map(f => String(f)) : []
  })) || [];
};

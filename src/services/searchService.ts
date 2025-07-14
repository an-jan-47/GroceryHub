import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export interface SearchFiltersType {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'name' | 'price' | 'rating';
  sortOrder: 'asc' | 'desc';
  brands: string[];
  inStock: boolean;
}

export interface SearchFiltersProps {
  onFilterChange: (filters: SearchFiltersType) => void;
  initialQuery?: string;
  initialCategory?: string;
  categories?: string[];
  brands?: string[];
}

export type SearchFilters = SearchFiltersType;

export const searchProducts = async (filters: SearchFiltersType): Promise<Product[]> => {
  let query = supabase
    .from('products')
    .select('*');

  if (filters.query) {
    query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,brand.ilike.%${filters.query}%`);
  }

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters.brands && filters.brands.length > 0) {
    query = query.in('brand', filters.brands);
  }

  if (filters.minPrice > 0) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters.maxPrice > 0 && filters.maxPrice !== 10000) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters.inStock) {
    query = query.gt('stock', 0);
  }

  const features = filters.query ? filters.query.toLowerCase().split(' ').filter((f: string) => f.length > 2) : [];
  if (features.length > 0) {
    const featureConditions = features.map(() => `features ? $1`).join(' OR ');
    query = query.or(featureConditions, { 
      referencedTable: undefined, 
      foreignTable: undefined 
    });
  }

  // Apply sorting
  if (filters.sortBy === 'price') {
    query = query.order('price', { ascending: filters.sortOrder === 'asc' });
  } else if (filters.sortBy === 'rating') {
    query = query.order('rating', { ascending: filters.sortOrder === 'asc' });
  } else {
    query = query.order('name', { ascending: filters.sortOrder === 'asc' });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }

  return (data || []).map(product => ({
    ...product,
    features: Array.isArray(product.features) ? product.features : (product.features ? [product.features] : [])
  }));
};

export const getCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('category');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const categories = [...new Set(data?.map(item => item.category) || [])];
  return categories.filter(Boolean);
};

export const getBrands = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('brand');

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  const brands = [...new Set(data?.map(item => item.brand) || [])];
  return brands.filter(Boolean);
};


import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data || [];
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,brand.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data || [];
};

export const getPopularProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('popular_products')
    .select(`
      product_id,
      total_orders,
      products (*)
    `)
    .order('total_orders', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching popular products:', error);
    return [];
  }

  return data?.map(item => item.products).filter(Boolean) || [];
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .gte('rating', 4.0)
    .order('rating', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data || [];
};

export const getSimilarProducts = async (productId: string, category: string, brand: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .neq('id', productId)
    .or(`category.eq.${category},brand.eq.${brand}`)
    .order('rating', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching similar products:', error);
    return [];
  }

  return data || [];
};

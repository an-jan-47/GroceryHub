
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching all products...');
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  console.log('Products fetched successfully:', data?.length || 0);
  console.log('Raw products data:', data);

  return data?.map(product => ({
    ...product,
    features: Array.isArray(product.features) ? product.features.map(f => String(f)) : []
  })) || [];
};

export const getProduct = async (id: string): Promise<Product | null> => {
  console.log('Fetching product with ID:', id);
  
  if (!id) {
    console.error('Product ID is required');
    return null;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  console.log('Product fetched:', data);

  return data ? {
    ...data,
    features: Array.isArray(data.features) ? data.features.map(f => String(f)) : []
  } : null;
};

// Alias for compatibility
export const getProductById = getProduct;

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  console.log('Fetching products by category:', category);
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data?.map(product => ({
    ...product,
    features: Array.isArray(product.features) ? product.features.map(f => String(f)) : []
  })) || [];
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  console.log('Searching products with query:', query);
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,brand.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data?.map(product => ({
    ...product,
    features: Array.isArray(product.features) ? product.features.map(f => String(f)) : []
  })) || [];
};

export const getPopularProducts = async (): Promise<Product[]> => {
  console.log('Fetching popular products...');
  
  const { data, error } = await supabase
    .from('popular_products')
    .select(`
      product_id,
      total_orders,
      products (*)
    `)
    .order('total_orders', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching popular products:', error);
    return [];
  }

  console.log('Popular products data:', data);

  return data?.map(item => {
    if (!item.products) return null;
    return {
      ...item.products,
      features: Array.isArray(item.products?.features) ? item.products.features.map(f => String(f)) : []
    };
  }).filter(Boolean) || [];
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  console.log('Fetching featured products...');
  
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

  return data?.map(product => ({
    ...product,
    features: Array.isArray(product.features) ? product.features.map(f => String(f)) : []
  })) || [];
};

export const getSimilarProducts = async (productId: string, category: string, brand: string): Promise<Product[]> => {
  console.log('Fetching similar products for:', { productId, category, brand });
  
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

  return data?.map(product => ({
    ...product,
    features: Array.isArray(product.features) ? product.features.map(f => String(f)) : []
  })) || [];
};

export const getProductCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching product count:', error);
    return 0;
  }

  return count || 0;
};

export const subscribeToProductChanges = (callback: (products: Product[]) => void) => {
  // Initial fetch
  getProducts().then(callback);

  // Set up real-time subscription
  const subscription = supabase
    .channel('products_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' }, 
      () => {
        getProducts().then(callback);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

// Export Product type for components
export type { Product };

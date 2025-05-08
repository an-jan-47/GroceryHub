
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Product = Database['public']['Tables']['products']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type PopularProduct = Database['public']['Tables']['popular_products']['Row'] & {
  product?: Product;
};

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false }); // Order by newest first
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data;
};

export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
  
  return data;
};

// Get popular products with their full information
export const getPopularProducts = async (limit = 4) => {
  const { data, error } = await supabase
    .from('popular_products')
    .select('*, product:product_id(*)')
    .order('total_orders', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching popular products:', error);
    throw error;
  }
  
  return data;
};

export const getProductReviews = async (productId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('date', { ascending: false });
  
  if (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    throw error;
  }
  
  return data;
};

// Improved algorithm for similar products
export const getSimilarProducts = async (category: string, currentProductId: string, limit = 3) => {
  // First try to find products in the same category
  const { data: categoryProducts, error: categoryError } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('id', currentProductId)
    .limit(limit);
  
  if (categoryError) {
    console.error(`Error fetching similar products by category:`, categoryError);
    throw categoryError;
  }
  
  // If we don't have enough products in same category, get some from different categories
  if (!categoryProducts || categoryProducts.length < limit) {
    const remainingCount = limit - (categoryProducts?.length || 0);
    
    const { data: otherProducts, error: otherError } = await supabase
      .from('products')
      .select('*')
      .neq('id', currentProductId)
      .neq('category', category)
      .limit(remainingCount);
    
    if (otherError) {
      console.error(`Error fetching additional similar products:`, otherError);
      throw otherError;
    }
    
    return [...(categoryProducts || []), ...(otherProducts || [])];
  }
  
  return categoryProducts;
};

// Function to get product count
export const getProductCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error getting product count:', error);
    throw error;
  }
  
  return count || 0;
};

// Setup real-time listener for product changes
export const subscribeToProductChanges = (callback: (products: Product[]) => void) => {
  // First fetch all products
  getProducts().then((initialProducts) => {
    callback(initialProducts || []);
  });
  
  // Then subscribe to real-time changes
  const channel = supabase
    .channel('product-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      () => {
        // When any change happens, refetch all products
        getProducts().then((updatedProducts) => {
          callback(updatedProducts || []);
        });
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

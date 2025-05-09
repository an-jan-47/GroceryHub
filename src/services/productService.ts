
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
    .order('created_at', { ascending: false });
  
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

// Search for products by term
export const searchProducts = async (searchTerm: string) => {
  if (!searchTerm.trim()) {
    return [];
  }
  
  const term = searchTerm.toLowerCase().trim();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${term}%,description.ilike.%${term}%,brand.ilike.%${term}%,category.ilike.%${term}%`)
    .limit(20);
  
  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }
  
  return data || [];
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

// Use the new DB function to update product stock
export const updateProductStock = async (productId: string, newStock: number): Promise<void> => {
  try {
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();
    
    if (fetchError) {
      console.error(`Error fetching product ${productId}:`, fetchError);
      throw fetchError;
    }
    
    const currentStock = product.stock;
    
    // Determine if we're increasing or decreasing stock
    if (newStock > currentStock) {
      const increaseAmount = newStock - currentStock;
      const { error } = await supabase.rpc('increase_product_stock', {
        product_id: productId,
        quantity: increaseAmount
      });
      
      if (error) {
        console.error(`Error increasing stock for product ${productId}:`, error);
        throw error;
      }
    } else if (newStock < currentStock) {
      const decreaseAmount = currentStock - newStock;
      const { error } = await supabase.rpc('decrease_product_stock', {
        product_id: productId,
        quantity: decreaseAmount
      });
      
      if (error) {
        console.error(`Error decreasing stock for product ${productId}:`, error);
        throw error;
      }
    }
    // If equal, no change needed
    
    console.log(`Stock updated for product ${productId}: ${currentStock} -> ${newStock}`);
  } catch (error) {
    console.error('Error in updateProductStock:', error);
    throw error;
  }
};

// Use the new DB function to decrement product stock
export const decrementProductStock = async (productId: string, quantity: number): Promise<void> => {
  try {
    const { error } = await supabase.rpc('decrease_product_stock', {
      product_id: productId,
      quantity: quantity
    });
    
    if (error) {
      console.error(`Error decreasing stock for product ${productId}:`, error);
      throw error;
    }
    
    console.log(`Stock decreased for product ${productId} by ${quantity}`);
    
    // Update popular products
    await updatePopularProduct(productId, quantity);
  } catch (error) {
    console.error('Error decrementing product stock:', error);
    throw error;
  }
};

// Update popular products count
export const updatePopularProduct = async (productId: string, quantity: number = 1): Promise<void> => {
  try {
    // Check if product already exists in popular_products
    const { data: existingEntry, error: checkError } = await supabase
      .from('popular_products')
      .select('id, total_orders')
      .eq('product_id', productId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw checkError;
    }
    
    if (existingEntry) {
      // Update existing entry
      const { error: updateError } = await supabase
        .from('popular_products')
        .update({ 
          total_orders: existingEntry.total_orders + quantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingEntry.id);
        
      if (updateError) {
        throw updateError;
      }
    } else {
      // Insert new entry
      const { error: insertError } = await supabase
        .from('popular_products')
        .insert([{ 
          product_id: productId, 
          total_orders: quantity,
          last_updated: new Date().toISOString()
        }]);
        
      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error updating popular products:', error);
    throw error;
  }
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

// Get stock update history for a product
export const getStockUpdateHistory = async (productId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('stock_updates')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error(`Error fetching stock history for product ${productId}:`, error);
    throw error;
  }
  
  return data || [];
};

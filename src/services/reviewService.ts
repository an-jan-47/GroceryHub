import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const getUserReviews = async (userId: string): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products:product_id (
          name,
          images
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }
};

export const createReview = async (reviewData: Omit<Review, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (
  reviewId: string, 
  reviewData: Partial<Omit<Review, 'id' | 'created_at'>>
) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update(reviewData)
      .eq('id', reviewId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
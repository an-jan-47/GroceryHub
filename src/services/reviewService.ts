
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types';

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data?.map(review => ({
    ...review,
    created_at: review.date || review.created_at || new Date().toISOString()
  })) || [];
};

export const getUserReviews = async (userId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      products (
        name,
        images
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }

  return data?.map(review => ({
    ...review,
    created_at: review.date || review.created_at || new Date().toISOString()
  })) || [];
};

export const createReview = async (review: Omit<Review, 'id' | 'created_at'>): Promise<Review | null> => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: review.product_id,
      user_id: review.user_id,
      user_name: review.user_name,
      rating: review.rating,
      comment: review.comment || '',
      date: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return null;
  }

  return {
    ...data,
    created_at: data.date || data.created_at || new Date().toISOString()
  };
};

import React, { useState, useEffect } from "react";

import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProductPurchases } from '@/hooks/useUserProductPurchases';
import { getProductById } from '@/services/productService';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const WriteReview = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user has purchased this product
  const { hasUserPurchased, isLoading: isCheckingPurchase } = useUserProductPurchases(
    productId ? [productId] : []
  );
  
  // Fetch product details
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId!),
    enabled: !!productId
  });
  
  // Check if user has already reviewed this product
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isCheckingReview, setIsCheckingReview] = useState(true);
  
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!user || !productId) return;
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking review:', error);
        }
        
        if (data) {
          setHasReviewed(true);
          // Pre-fill the form with existing review data
          setRating(data.rating);
          setReview(data.comment || '');
        }
      } catch (error) {
        console.error('Error checking review:', error);
      } finally {
        setIsCheckingReview(false);
      }
    };
    
    checkExistingReview();
  }, [user, productId]);
  
  // Redirect if user is not logged in
  useEffect(() => {
    if (!user && !isLoadingProduct) {
      toast('Please sign in to write a review');
      navigate('/login');
    }
  }, [user, navigate, isLoadingProduct]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user || !productId) {
      toast('You must be logged in to submit a review');
      return;
    }
    
    if (rating === 0) {
      toast('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        product_id: productId,
        user_id: user.id,
        user_name: user.user_metadata?.name || user.email,
        rating,
        comment: review,
      };
      
      let response;
      
      if (hasReviewed) {
        // Update existing review
        response = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('product_id', productId)
          .eq('user_id', user.id);
      } else {
        // Insert new review
        response = await supabase
          .from('reviews')
          .insert(reviewData);
      }
      
      if (response.error) throw response.error;
      
      toast(hasReviewed ? 'Review updated successfully' : 'Review submitted successfully');
      navigate(`/product/${productId}`);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast('Failed to submit review: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state
  if (isLoadingProduct || isCheckingPurchase || isCheckingReview) {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen">
        <Header />
        <main className="container px-4 py-4 mx-auto max-w-3xl">
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }
  
  // If user hasn't purchased this product, show error
  if (!hasUserPurchased(productId!) && !hasReviewed) {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen">
        <Header />
        <main className="container px-4 py-4 mx-auto max-w-3xl">
          <div className="py-3 flex items-center">
            <Link to={`/product/${productId}`} className="flex items-center text-gray-500">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span>Back to Product</span>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-amber-500 mb-4">
              <Star className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">Purchase Required</h3>
            <p className="text-gray-500 mb-6">
              You can only review products that you have purchased.
            </p>
            <Button asChild>
              <Link to={`/product/${productId}`}>View Product</Link>
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header />
      
      <main className="container px-4 py-4 mx-auto max-w-3xl">
        <div className="py-3 flex items-center">
          <Link to={`/product/${productId}`} className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Product</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">
          {hasReviewed ? 'Edit Your Review' : 'Write a Review'}
        </h1>
        
        {product && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center mr-3">
                {product.images && product.images[0] ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <div className="h-8 w-8 text-gray-400" />
                )}
              </div>
              
              <div>
                <h2 className="font-medium">{product.name}</h2>
                <p className="text-sm text-gray-500">{product.brand}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Your Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="review" className="block text-sm font-medium mb-2">
                Your Review
              </label>
              <Textarea
                id="review"
                placeholder="Share your experience with this product..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting 
                ? 'Submitting...' 
                : hasReviewed 
                  ? 'Update Review' 
                  : 'Submit Review'
              }
            </Button>
          </form>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default WriteReview;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

const ReviewForm = ({ productId, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRatingClick = (value: number) => {
    setRating(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast("Please sign in", {
        description: "You need to be signed in to submit a review."
      });
      return;
    }
    
    if (rating === 0) {
      toast("Rating required", {
        description: "Please select a rating before submitting."
      });
      return;
    }
    
    if (!comment.trim()) {
      toast("Comment required", {
        description: "Please write a comment for your review."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          user_name: user.email?.split('@')[0] || 'Anonymous',
          rating,
          comment,
          date: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast("Review submitted", {
        description: "Thank you for your feedback!"
      });
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast("Error submitting review", {
        description: "Something went wrong. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 font-medium">Your Rating</p>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRatingClick(value)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 ${
                  rating >= value 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'fill-none text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {rating > 0 ? `${rating} out of 5` : 'Select rating'}
          </span>
        </div>
      </div>
      
      <div>
        <p className="mb-2 font-medium">Your Review</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="resize-none"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;

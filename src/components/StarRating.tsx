
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const StarRating = ({ 
  rating, 
  maxStars = 5, 
  size = 'md',
  showValue = true 
}: StarRatingProps) => {
  // Get sizes based on the size prop
  const getStarSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };
  
  const starSize = getStarSize();
  
  return (
    <div className="flex items-center">
      <div className="flex">
        {[...Array(maxStars)].map((_, i) => (
          <Star 
            key={i} 
            className={`${starSize} ${
              i < Math.floor(rating) 
                ? 'text-yellow-400 fill-yellow-400' 
                : (i < rating && i + 1 > rating)
                  ? 'text-yellow-400 fill-yellow-400 opacity-60'
                  : 'text-gray-300'
            }`} 
          />
        ))}
      </div>
      
      {showValue && (
        <span className={`ml-1 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;

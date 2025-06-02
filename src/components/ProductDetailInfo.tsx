
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/StarRating';

interface ProductDetailInfoProps {
  product: {
    id: string;
    name: string;
    price: number;
    sale_price?: number;
    rating: number;
    review_count: number;
    brand: string;
    category: string;
    description: string;
  };
  quantity: number;
  onIncrementQuantity: () => void;
  onDecrementQuantity: () => void;
}

const ProductDetailInfo = ({ 
  product, 
  quantity, 
  onIncrementQuantity, 
  onDecrementQuantity 
}: ProductDetailInfoProps) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-start">
        <h1 className="text-xl font-bold">{product.name}</h1>
      </div>
      
      <div className="flex items-center mt-1">
        <div className="flex items-center">
          <StarRating rating={product.rating} size="sm" />
        </div>
        <span className="mx-2 text-gray-300">|</span>
        <span className="text-sm text-gray-600">{product.review_count} reviews</span>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div>
          <span className="text-2xl font-bold text-blue-600">₹{product.sale_price || product.price}</span>
          {product.sale_price && (
            <span className="ml-2 text-base line-through text-gray-500">₹{product.price}</span>
          )}
        </div>
        
        {/* Quantity selector */}
        <div className="flex items-center border rounded-md">
          <button 
            onClick={onDecrementQuantity}
            className="px-3 py-1 text-lg"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-3 py-1">{quantity}</span>
          <button 
            onClick={onIncrementQuantity}
            className="px-3 py-1 text-lg"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Brand and category */}
      <div className="flex flex-wrap gap-2 mt-2">
        <Badge variant="outline" className="text-xs">{product.brand}</Badge>
        <Badge variant="outline" className="text-xs">{product.category}</Badge>
      </div>
      
      {/* Description */}
      <div className="mt-4">
        <h2 className="font-semibold mb-2">Description</h2>
        <p className="text-gray-600 text-sm">{product.description}</p>
      </div>
    </div>
  );
};

export default ProductDetailInfo;


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProduct, getProducts } from '@/services/productService';
import { getProductReviews } from '@/services/reviewService';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from '@/components/ui/sonner';
import { ChevronLeft, ShoppingCart, Star, Plus, Minus, Share2, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/ProductCard';
import StarRating from '@/components/StarRating';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  console.log('ProductDetail - Product ID from params:', id);

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => {
      if (!id) {
        console.error('No product ID provided');
        throw new Error('Product ID is required');
      }
      console.log('Fetching product with ID:', id);
      return getProduct(id);
    },
    enabled: !!id,
    retry: 1
  });

  console.log('Product query result:', { product, isLoading, error });

  // Fetch all products for similar products
  const { data: allProducts } = useQuery({
    queryKey: ['allProducts'],
    queryFn: getProducts
  });

  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: () => getProducts(),
    enabled: !!product?.category,
    select: (data) => data
      .filter(p => p.category === product?.category && p.id !== product?.id)
      .slice(0, 4)
  });
  
  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (productId) {
      setIsFavorite(isInWishlist(productId));
    }
  }, [productId, isInWishlist]);
  
  // Handle quantity changes
  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else {
      toast("Limited stock", {
        description: `Only ${product?.stock} units available`,
        position: "bottom-center"
      });
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  // Add to cart function
  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.sale_price,
        images: product.images,
        quantity,
        stock: product.stock
      });
      toast('Added to cart', {
        description: `${quantity} × ${product.name}`
      });
    }
  };

  // Buy now function
  const handleBuyNow = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.sale_price,
        images: product.images,
        quantity,
        stock: product.stock
      });
      navigate('/address');
    }
  };
  
  // Toggle wishlist function
  const toggleWishlist = () => {
    if (!product) return;
    
    if (isFavorite) {
      removeFromWishlist(product.id);
      setIsFavorite(false);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        sale_price: product.sale_price,
        images: product.images,
      });
      setIsFavorite(true);
    }
  };
  
  // Share product function
  const shareProduct = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on GroceryHub!`,
      url: window.location.href,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast('Shared successfully', {
          description: 'Product has been shared',
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href);
        toast('Link copied', {
          description: 'Product link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast('Sharing failed', {
        description: 'Could not share the product',
      });
    }
  };

  if (error) {
    console.error('Error loading product:', error);
    return (
      <div className="pb-20">
        <Header />
        <div className="container px-4 py-4 mx-auto text-center">
          <h1 className="text-2xl font-bold">Error loading product</h1>
          <p className="text-gray-600 mb-4">There was an error loading the product details.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pb-20">
        <Header />
        <main className="container px-4 py-8 mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }
  
  // Error state
  if (isError || !product) {
    return (
      <div className="pb-20">
        <Header />
        <div className="container px-4 py-4 mx-auto text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <Header />
      <main className="container px-4 py-2 mx-auto">
        {/* Product image */}
        <div className="mb-4 rounded-lg overflow-hidden bg-white relative">
          <img 
            src={product.images?.[0] || '/placeholder.svg'} 
            alt={product.name} 
            className="w-full h-64 object-contain"
          />
          
          {/* Action buttons for wishlist and share */}
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full bg-white ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}
              onClick={toggleWishlist}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white text-gray-500"
              onClick={shareProduct}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Discount badge */}
          {discountPercentage && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {discountPercentage}% OFF
            </div>
          )}
        </div>
        
        {/* Product info */}
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
            
            {/* Quantity selector moved next to price */}
            <div className="flex items-center border rounded-md">
              <button 
                onClick={decrementQuantity}
                className="px-3 py-1 text-lg"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-3 py-1">{quantity}</span>
              <button 
                onClick={incrementQuantity}
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
        </div>
        
        <Separator className="my-4" />
        
        {/* Description */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-gray-600 text-sm">{product.description}</p>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            variant="outline" 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          
          <Button 
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Buy Now
          </Button>
        </div>
        
        {/* Reviews section */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3">Reviews</h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{review.user_name}</p>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No reviews yet</p>
              <Button 
                variant="link" 
                onClick={() => navigate(`/write-review/${productId}`)}
                className="mt-2 text-blue-500"
              >
                Be the first to review
              </Button>
            </div>
          )}
        </div>
        
        {/* Related products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">Related Products</h2>
            <div className="grid grid-cols-2 gap-3">
              {relatedProducts.map(relatedProduct => (
                <ProductCard 
                  key={relatedProduct.id} 
                  product={relatedProduct} 
                  className="h-full"
                />
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default ProductDetailPage;

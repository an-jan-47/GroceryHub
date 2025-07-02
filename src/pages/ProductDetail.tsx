import React, { useState, useEffect } from "react";

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
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/ProductCard';
import StarRating from '@/components/StarRating';
import ProductDetailImage from '@/components/ProductDetailImage';
import ProductDetailInfo from '@/components/ProductDetailInfo';
import ProductDetailActions from '@/components/ProductDetailActions';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch product details
  const { data: product, isLoading, error, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      return getProduct(productId);
    },
    enabled: !!productId,
    retry: 1
  });

  // Fetch product reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => productId ? getProductReviews(productId) : [],
    enabled: !!productId
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

  // Check if product is in wishlist on component mount (prevent infinite update)
  useEffect(() => {
    if (productId) {
      // Only set state if needed, don't depend on isInWishlist function reference
      setIsFavorite(isInWishlist(productId));
    }
    // Only depend on productId (not isInWishlist, which is unstable)
  }, [productId]);

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
  const handleAddToCart = (qty: number = quantity) => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.sale_price,
        images: product.images,
        quantity: qty,
        stock: product.stock
      });
      toast('Added to cart', {
        description: `${qty} × ${product.name}`
      });
    }
  };
  
  // Buy now function
  const handleBuyNow = (qty: number = quantity) => {
    if (product) {
      const total = (product.sale_price ?? product.price) * qty;
      if (total <= 2000) {
        toast('Minimum order value is ₹2000 to proceed ', { position: 'bottom-center' });
        return;
      }
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.sale_price,
        images: product.images,
        quantity: qty,
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

  if (error) {
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
        {/* Product Image Component */}
        <ProductDetailImage 
          product={product}
          isFavorite={isFavorite}
          onToggleWishlist={toggleWishlist}
        />
        
        {/* Product Info Component */}
        <ProductDetailInfo 
          product={product}
          quantity={quantity}
          onIncrementQuantity={incrementQuantity}
          onDecrementQuantity={decrementQuantity}
        />
        
        <Separator className="my-4" />
        
        {/* Action Buttons Component */}
        <ProductDetailActions 
          product={product}
          quantity={quantity}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
        
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
                      {new Date(review.created_at || review.date).toLocaleDateString()}
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
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id}>
                  <ProductCard
                    product={relatedProduct}
                    className="flex-shrink-0"
                  />
                </div>
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


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Share2, ShoppingCart, Plus, Minus, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { getProductById } from '@/services/productService';
import { getProductReviews } from '@/services/reviewService';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ReviewForm from '@/components/ReviewForm';
import LoadingSpinner from '@/components/LoadingSpinner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getProductReviews(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (productError) {
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    }
  }, [productError, toast]);

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">Product not found</h2>
          <Button onClick={() => navigate('/')}>Go back to home</Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const currentQuantityInCart = getItemQuantity(product.id);
  const isInStock = product.stock > 0;
  const canAddMore = currentQuantityInCart + quantity <= product.stock;

  // Calculate pricing
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const displayPrice = product.sale_price || product.price;
  const originalPrice = product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!canAddMore) {
      toast({
        title: "Stock Limit",
        description: `Only ${product.stock - currentQuantityInCart} items available`,
        variant: "destructive",
      });
      return;
    }

    addToCart({
      ...product,
      quantity: quantity
    });

    toast({
      title: "Added to Cart",
      description: `${quantity} ${product.name} added to cart`,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.name} ${isWishlisted ? 'removed from' : 'added to'} your wishlist`,
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      {/* Navigation Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleWishlist}
            className="p-2"
          >
            <Heart 
              className={`w-5 h-5 ${
                isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'
              }`} 
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="p-2"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Product Images */}
        <Card>
          <CardContent className="p-0">
            <Carousel className="w-full">
              <CarouselContent>
                {product.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square relative">
                      <img
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-t-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/400/400';
                        }}
                      />
                      {hasDiscount && (
                        <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                          {discountPercentage}% OFF
                        </Badge>
                      )}
                      {!isInStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                          <Badge variant="destructive" className="text-lg py-2 px-4">
                            Out of Stock
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {product.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
          </CardContent>
        </Card>

        {/* Product Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{product.brand}</Badge>
                <div className="flex items-center space-x-1">
                  {renderStars(Math.floor(product.rating))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({product.review_count} reviews)
                  </span>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl font-bold text-green-600">
                  ₹{displayPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Info */}
            <div className="flex items-center justify-between py-3 border-t border-b">
              <span className="text-sm font-medium">
                Availability:
              </span>
              <Badge variant={isInStock ? "default" : "destructive"}>
                {isInStock ? `${product.stock} in stock` : 'Out of stock'}
              </Badge>
            </div>

            {/* Quantity Selector */}
            {isInStock && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-semibold w-8 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!canAddMore}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            {isInStock && (
              <Button
                onClick={handleAddToCart}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                disabled={!canAddMore}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart - ₹{(displayPrice * quantity).toFixed(2)}
              </Button>
            )}

            {currentQuantityInCart > 0 && (
              <p className="text-sm text-gray-600 text-center">
                {currentQuantityInCart} already in cart
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Details and Reviews */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details & Features</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Product Features</h3>
                {product.features && product.features.length > 0 ? (
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No additional features listed.</p>
                )}
                
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span>
                      <span className="ml-2 text-gray-600">{product.category}</span>
                    </div>
                    <div>
                      <span className="font-medium">Brand:</span>
                      <span className="ml-2 text-gray-600">{product.brand}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-4">
              {/* Reviews List */}
              {reviewsLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <LoadingSpinner />
                  </CardContent>
                </Card>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{review.user_name}</h4>
                          <div className="flex items-center space-x-1 mt-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at || review.date || '').toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No reviews yet</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Review Form */}
              <ReviewForm productId={product.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProductDetail;

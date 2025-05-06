
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Heart, 
  ShoppingCart, 
  Star, 
  Plus, 
  Minus,
  Truck,
  Share2,
  Clock,
  Shield,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Temporary product data
const PRODUCT = {
  id: '2',
  name: "Smart Watch Pro",
  description: "The Smart Watch Pro is a premium wearable device designed for fitness enthusiasts and tech-savvy individuals. With its sleek design and advanced features, it's the perfect companion for your daily activities.",
  price: 299.99,
  salePrice: 249.99,
  images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
  category: 'Wearables',
  brand: 'TechWear',
  rating: 4.7,
  reviewCount: 126,
  stock: 15,
  features: [
    "Health monitoring with heart rate and SpO2 sensors",
    "Water resistant up to 50 meters",
    "7-day battery life on a single charge",
    "Customizable watch faces and bands",
    "Smart notifications and apps"
  ],
  reviews: [
    { id: '1', user: 'John D.', rating: 5, comment: 'Excellent watch! Battery life is amazing.', date: '2023-10-15' },
    { id: '2', user: 'Sarah M.', rating: 4, comment: 'Great features but the app could be better.', date: '2023-09-28' },
    { id: '3', user: 'Robert K.', rating: 5, comment: "Best smartwatch I've owned so far.", date: '2023-11-02' }
  ],
  similarProducts: [
    { id: '7', name: 'Fitness Tracker', price: 79.99, image: '/placeholder.svg', rating: 4.2 },
    { id: '9', name: 'Sports Watch', price: 149.99, image: '/placeholder.svg', rating: 4.5 },
    { id: '10', name: 'Smart Band Pro', price: 89.99, image: '/placeholder.svg', rating: 4.0 }
  ]
};

const ProductDetail = () => {
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { toast } = useToast();
  
  const product = PRODUCT; // In a real app, fetch product by productId
  
  // Check if product is already in cart
  const productInCart = cartItems.find(item => item.id === product.id);
  const quantityInCart = productInCart ? productInCart.quantity : 0;
  
  const handleAddToCart = () => {
    if (productInCart) {
      updateQuantity(product.id, productInCart.quantity + quantity);
      toast({
        title: "Updated cart quantity",
        description: `${product.name} (${productInCart.quantity + quantity}) has been updated in your cart`,
      });
    } else {
      addToCart({ ...product, quantity });
      toast({
        title: "Added to cart",
        description: `${product.name} (${quantity}) has been added to your cart`,
      });
    }
  };
  
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
  
  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isWishlisted ? "removed from" : "added to"} your wishlist`,
    });
  };
  
  // Generate star rating elements
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };
  
  // Calculate discount percentage
  const discountPercentage = product.salePrice 
    ? Math.round((1 - product.salePrice / product.price) * 100) 
    : 0;
  
  return (
    <div className="pb-20 bg-gray-50">
      <Header />
      
      <main className="container px-4 pb-6 mx-auto">
        {/* Navigation */}
        <div className="py-2 flex items-center">
          <Link to="/explore" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to products</span>
          </Link>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          {/* Product Images and Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full">
              <Carousel className="w-full">
                <CarouselContent>
                  {product.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="flex items-center justify-center h-64 md:h-80">
                        <img 
                          src={image} 
                          alt={`${product.name} view ${index + 1}`} 
                          className="h-full object-contain" 
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </Carousel>
              
              <div className="flex justify-center space-x-2 mt-4">
                {product.images.map((image, index) => (
                  <button 
                    key={index}
                    className={`w-14 h-14 border rounded-md overflow-hidden ${index === 0 ? 'border-blue-500' : 'border-gray-200'}`}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4 md:hidden">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="bg-white border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white h-14"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  ADD TO CART
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600 h-14">
                  BUY NOW
                </Button>
              </div>
            </div>
            
            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-xl font-medium text-gray-800">{product.name}</h1>
                <button 
                  onClick={handleToggleWishlist}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
              
              <div className="flex items-center mt-1 mb-2">
                <div className="flex">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-blue-500 ml-2 hover:underline cursor-pointer">
                  {product.rating} ({product.reviewCount} ratings)
                </span>
                <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                  Top Seller
                </span>
              </div>
              
              <p className="text-gray-500 text-sm mb-4">{product.brand} | {product.category}</p>
              
              {/* Price Section */}
              <div className="mb-5">
                {product.salePrice ? (
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-green-600">${product.salePrice.toFixed(2)}</span>
                      <span className="ml-3 text-gray-500 line-through text-base">${product.price.toFixed(2)}</span>
                      <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-sm text-xs font-medium">
                        {discountPercentage}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Limited time deal</p>
                  </div>
                ) : (
                  <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                )}
              </div>
              
              {/* Delivery */}
              <div className="border border-gray-200 rounded-lg p-3 mb-4 space-y-2 bg-gray-50">
                <div className="flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Free Delivery</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">1 Year Warranty</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Check className="w-5 h-5 mr-2 text-green-600" />
                  <p className="text-sm">7-day easy return policy</p>
                </div>
              </div>
              
              {/* Quantity */}
              <div className="mb-6">
                <span className="text-gray-700 text-sm font-medium">Quantity:</span>
                <div className="flex items-center mt-2 border border-gray-300 inline-flex rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 text-gray-600 hover:text-orange-500 disabled:opacity-50 border-r border-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-1 font-medium text-sm">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 text-gray-600 hover:text-orange-500 border-l border-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {quantityInCart > 0 && (
                  <span className="ml-3 text-xs text-gray-500">
                    ({quantityInCart} already in cart)
                  </span>
                )}
              </div>
              
              {/* Desktop Action Buttons */}
              <div className="hidden md:grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="bg-white border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white h-14 text-base"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  ADD TO CART
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600 h-14 text-base">
                  BUY NOW
                </Button>
              </div>
              
              {/* Share */}
              <div className="mt-4 text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500"
                  onClick={() => {
                    toast({
                      title: "Share feature",
                      description: "Share functionality will be implemented soon",
                    });
                  }}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for Description and Reviews */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="pt-4 space-y-4">
              <p className="text-gray-700">{product.description}</p>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Key Features</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-gray-700">{feature}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Customer Reviews</h3>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-sm ml-2">{product.rating} out of 5</span>
                    </div>
                    <p className="text-sm text-gray-500">{product.reviewCount} global ratings</p>
                  </div>
                  <Button variant="outline" size="sm">Write a Review</Button>
                </div>
                
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{review.user}</span>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    <div className="flex py-1">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Similar Products */}
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-3 px-1">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {product.similarProducts.map((item) => (
              <div key={item.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <Link to={`/product/${item.id}`} className="block relative pt-[100%]">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="absolute inset-0 w-full h-full object-contain p-2"
                  />
                </Link>
                <div className="p-3">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-medium text-sm line-clamp-2 h-10">{item.name}</h3>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {renderStars(item.rating)}
                      </div>
                    </div>
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold">${item.price.toFixed(2)}</span>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        addToCart({ ...item, quantity: 1 });
                        toast({
                          title: "Added to cart",
                          description: `${item.name} has been added to your cart`,
                        });
                      }}
                      className="h-8 px-2 border-gray-300"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Ad Space */}
        <div className="bg-gray-100 h-20 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Ad Space</p>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ProductDetail;


import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Heart, 
  ShoppingCart, 
  Star, 
  Plus, 
  Minus,
  Truck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

// Temporary product data
const PRODUCT = {
  id: '2',
  name: 'Smart Watch Pro',
  description: "The Smart Watch Pro is a premium wearable device designed for fitness enthusiasts and tech-savvy individuals. With its sleek design and advanced features, it's the perfect companion for your daily activities.",
  price: 299.99,
  salePrice: 249.99,
  images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
  category: 'Wearables',
  brand: 'TechWear',
  rating: 4.7,
  reviewCount: 126,
  stock: 15,
  specifications: {
    'Display': '1.4" AMOLED',
    'Battery': 'Up to 7 days',
    'Water Resistance': '5 ATM',
    'Connectivity': 'Bluetooth 5.0, Wi-Fi',
    'Sensors': 'Heart rate, SpO2, Accelerometer',
    'Materials': 'Aluminum case, Silicone band'
  },
  reviews: [
    { id: '1', user: 'John D.', rating: 5, comment: 'Excellent watch! Battery life is amazing.', date: '2023-10-15' },
    { id: '2', user: 'Sarah M.', rating: 4, comment: 'Great features but the app could be better.', date: '2023-09-28' },
    { id: '3', user: 'Robert K.', rating: 5, comment: "Best smartwatch I've owned so far.", date: '2023-11-02' }
  ]
};

const ProductDetail = () => {
  const { productId } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const product = PRODUCT; // In a real app, fetch product by productId
  
  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    toast({
      title: "Added to cart",
      description: `${product.name} (${quantity}) has been added to your cart`,
    });
  };
  
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
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
  
  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 pb-4 mx-auto">
        {/* Navigation */}
        <div className="py-3 flex items-center">
          <Link to="/" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </Link>
        </div>
        
        {/* Product Images */}
        <div className="rounded-lg overflow-hidden mb-4">
          <img 
            src={product.images[selectedImage]} 
            alt={product.name} 
            className="w-full h-64 object-cover object-center"
          />
          <div className="flex space-x-2 mt-2">
            {product.images.map((image, index) => (
              <button 
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative w-16 h-16 border-2 rounded-md overflow-hidden ${index === selectedImage ? 'border-brand-blue' : 'border-transparent'}`}
              >
                <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <button 
                onClick={handleToggleWishlist}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-gray-500">{product.rating} ({product.reviewCount} reviews)</span>
            </div>
          </div>
          
          {/* Price */}
          <div>
            {product.salePrice ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold text-brand-blue">${product.salePrice.toFixed(2)}</span>
                <span className="text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                  {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Quantity:</span>
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-2 text-gray-600 hover:text-brand-blue disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-1">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="p-2 text-gray-600 hover:text-brand-blue disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-gray-500">{product.stock} available</span>
          </div>
          
          {/* Add to Cart Button */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button className="w-full bg-brand-blue hover:bg-brand-darkBlue">
              Buy Now
            </Button>
          </div>
          
          {/* Delivery */}
          <div className="flex items-center text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
            <Truck className="w-5 h-5 mr-2 text-brand-blue" />
            <span>Free delivery on orders over $50</span>
          </div>
        </div>
        
        {/* Tabs for Description, Specs, and Reviews */}
        <div className="mt-6">
          <Tabs defaultValue="description">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-4">
              <p className="text-gray-700">{product.description}</p>
            </TabsContent>
            <TabsContent value="specifications" className="pt-4">
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 py-2 border-b border-gray-100">
                    <span className="text-gray-500">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-4">
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{review.user}</span>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    <div className="flex py-1">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Ad Space */}
        <div className="mt-8 bg-gray-100 h-20 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Ad Space</p>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ProductDetail;

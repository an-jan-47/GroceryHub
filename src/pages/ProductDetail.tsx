import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Star, Plus, Minus, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ProductCard from '@/components/ProductCard';
import { toast } from '@/components/ui/sonner';
import { useQuery } from '@tanstack/react-query';
import { getProduct, getProducts } from '@/services/productService';

const ProductDetailPage = () => {
  const { id } = useParams();
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

  // Get similar products based on brand and category
  const similarProducts = allProducts?.filter(p => 
    p.id !== product?.id && 
    (p.brand === product?.brand || p.category === product?.category)
  ).slice(0, 8) || [];

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.stock <= 0) {
      toast("Out of stock", {
        description: `${product.name} is currently unavailable`
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price,
      images: product.images,
      quantity: 1,
      stock: product.stock
    });
  };

  const getQuantityInCart = () => {
    if (!product) return 0;
    const item = cartItems.find(item => item.id === product.id);
    return item ? item.quantity : 0;
  };

  const quantityInCart = getQuantityInCart();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied", {
        description: "Product link copied to clipboard"
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
        <div className="container px-4 py-4 mx-auto">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!product) {
    console.error('Product is null after loading');
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

  const discountPercentage = product.sale_price 
    ? Math.round((1 - product.sale_price / product.price) * 100) 
    : null;

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        {/* Back Button */}
        <div className="py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </button>
        </div>

        {/* Product Images */}
        <div className="mb-6">
          <div className="relative mb-4">
            <img 
              src={product.images[selectedImageIndex]} 
              alt={product.name}
              className="w-full h-96 object-contain bg-gray-50 rounded-lg"
            />
            {product.sale_price && (
              <Badge className="absolute top-2 right-2 bg-red-500">
                {discountPercentage}% OFF
              </Badge>
            )}
            {product.stock <= 0 && (
              <Badge className="absolute top-2 left-2 bg-gray-800">
                Out of Stock
              </Badge>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 ${
                    selectedImageIndex === index ? 'border-brand-blue' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-xl font-bold">{product.name}</h1>
            <div className="flex gap-2">
              <button onClick={handleShare}>
                <Share2 className="w-5 h-5 text-gray-500" />
              </button>
              <button>
                <Heart className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 mb-2">{product.brand}</p>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {product.rating.toFixed(1)} ({product.review_count} reviews)
              </span>
            </div>
          </div>

          <div className="mb-4">
            {product.sale_price ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-brand-blue">₹{product.sale_price.toFixed(2)}</span>
                <span className="text-lg text-gray-500 line-through">₹{product.price.toFixed(2)}</span>
                <Badge variant="destructive">{discountPercentage}% OFF</Badge>
              </div>
            ) : (
              <span className="text-2xl font-bold text-brand-blue">₹{product.price.toFixed(2)}</span>
            )}
          </div>

          <div className="mb-4">
            <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700">{product.description}</p>
        </div>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Similar Products</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/explore')}
              >
                View All Products
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarProducts.map((similarProduct) => (
                <ProductCard 
                  key={similarProduct.id} 
                  product={similarProduct}
                  showBuyNow={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t p-4 z-40">
          <div className="container mx-auto flex gap-3">
            {quantityInCart > 0 ? (
              <div className="flex-1 flex items-center border rounded-lg">
                <button
                  onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                  className="p-3 text-gray-600 hover:text-brand-blue"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="flex-1 text-center font-medium">{quantityInCart}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantityInCart + 1)}
                  className="p-3 text-gray-600 hover:text-brand-blue"
                  disabled={product.stock <= 0 || quantityInCart >= product.stock}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            )}
            
            {product.stock > 0 && (
              <Button 
                onClick={() => navigate('/address')}
                className="flex-1 bg-brand-blue hover:bg-brand-darkBlue"
              >
                Buy Now
              </Button>
            )}
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ProductDetailPage;

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Star, Plus, Minus, Search } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';
import type { CarouselApi } from '@/components/ui/carousel';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getPopularProducts, Product } from '@/services/productService';
import PopularProducts from '@/components/PopularProducts';

// For categories and banners we'll keep the hardcoded data for now
const CATEGORIES = [
  { id: '1', name: 'Electronics', image: '/placeholder.svg', count: '120+ items' },
  { id: '2', name: 'Fashion', image: '/placeholder.svg', count: '210+ items' },
  { id: '3', name: 'Home & Kitchen', image: '/placeholder.svg', count: '75+ items' },
];

const BANNERS = [
  { id: '1', image: '/placeholder.svg', title: 'New Arrivals', subtitle: 'Check out our latest products', link: '/explore?category=New' },
  { id: '2', image: '/placeholder.svg', title: 'Summer Sale', subtitle: 'Up to 50% off', link: '/search?query=sale' },
  { id: '3', image: '/placeholder.svg', title: 'Exclusive Deals', subtitle: 'Limited time offers', link: '/explore' },
  { id: '4', image: '/placeholder.svg', title: 'Flash Sale', subtitle: 'Today only - premium products', link: '/search?category=premium' },
  { id: '5', image: '/placeholder.svg', title: 'Trending Items', subtitle: 'Most popular this month', link: '/search?sort=popular' },
];

const HomePage = () => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { toast } = useToast();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Fetch products from Supabase
  const { 
    data: products, 
    isLoading: isLoadingProducts 
  } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: getProducts
  });

  // Auto rotate banner carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prevIndex => 
        prevIndex === BANNERS.length - 1 ? 0 : prevIndex + 1
      );
      carouselApi?.scrollTo(currentBannerIndex);
    }, 5000); // Change banner every 5 seconds
    
    return () => clearInterval(interval);
  }, [carouselApi, currentBannerIndex]);
  
  // Handle carousel api change
  useEffect(() => {
    if (!carouselApi) return;
    
    const onSelect = () => {
      setCurrentBannerIndex(carouselApi.selectedScrollSnap());
    };
    
    carouselApi.on("select", onSelect);
    
    // Cleanup
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);
  
  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
      toast({
        title: "Updated cart quantity",
        description: `${product.name} quantity updated to ${existingItem.quantity + 1}`,
      });
    } else {
      addToCart({
        ...product,
        quantity: 1,
      });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    }
  };
  
  const getProductQuantityInCart = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  // Get featured products - first 4 items or fewer if less available
  const featuredProducts = products ? products.slice(0, 4) : [];
  
  return (
    <div className="pb-20">
      <Header />
      
      {/* Search bar below header */}
      <div className="sticky top-16 z-40 bg-white pb-2 pt-3 px-4 border-b border-gray-100 shadow-sm">
        <form onSubmit={handleSearch} className="relative w-full">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-gray-50"
          />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <Search className="w-5 h-5 text-gray-500" />
          </button>
        </form>
      </div>
      
      <main className="container px-4 py-4 mx-auto space-y-6">
        {/* Hero Carousel */}
        <Carousel className="w-full" setApi={setCarouselApi} opts={{ startIndex: currentBannerIndex }}>
          <CarouselContent>
            {BANNERS.map((banner) => (
              <CarouselItem key={banner.id} className="relative">
                <Link to={banner.link} className="block">
                  <div className="h-48 md:h-64 rounded-lg overflow-hidden relative">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-5 flex flex-col justify-end">
                      <h3 className="text-xl font-bold text-white">{banner.title}</h3>
                      <p className="text-sm text-white/90">{banner.subtitle}</p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious />
            <CarouselNext />
          </div>
          <div className="mt-2 flex justify-center gap-1">
            {BANNERS.map((_, index) => (
              <div 
                key={index} 
                className={`h-1.5 rounded-full transition-all ${index === currentBannerIndex ? 'w-6 bg-brand-blue' : 'w-2 bg-gray-300'}`} 
              />
            ))}
          </div>
        </Carousel>
        
        {/* Popular Products Section */}
        <PopularProducts />
        
        {/* Google Ads Section */}
        <div className="bg-gray-100 h-20 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Ad Space</p>
        </div>
        
        {/* Categories */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Categories</h2>
            <Link to="/explore" className="text-brand-blue text-sm">See all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => (
              <Link 
                to={`/explore?category=${category.name}`} 
                key={category.id}
                className="relative rounded-lg overflow-hidden group"
              >
                <div className="h-32 bg-gray-100 relative">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 p-3 flex flex-col justify-end">
                    <h3 className="font-medium text-white">{category.name}</h3>
                    <p className="text-xs text-white/80">{category.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Most Popular Products */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Most Popular</h2>
            <Link to="/explore" className="text-brand-blue text-sm">See all</Link>
          </div>
          
          {isLoadingProducts ? (
            <div className="py-8 text-center">
              <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product: Product) => (
                <Card key={product.id} className="product-card animate-fade-in">
                  <Link to={`/product/${product.id}`}>
                    <div className="relative">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'} 
                        alt={product.name} 
                        className="product-image"
                      />
                      {product.sale_price && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Sale
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-3">
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="font-medium text-sm truncate">{product.name}</h3>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs ml-1">{product.rating}</span>
                      </div>
                    </Link>
                    <div className="mt-2 flex items-center justify-between">
                      {product.sale_price ? (
                        <div>
                          <span className="font-bold text-brand-blue">${product.sale_price.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 line-through ml-1">${product.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 pt-0">
                    {getProductQuantityInCart(product.id) > 0 ? (
                      <div className="w-full flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(product.id, getProductQuantityInCart(product.id) - 1)}
                          className="p-2 text-gray-600 hover:text-brand-blue"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-center">{getProductQuantityInCart(product.id)}</span>
                        <button
                          onClick={() => updateQuantity(product.id, getProductQuantityInCart(product.id) + 1)}
                          className="p-2 text-gray-600 hover:text-brand-blue"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleAddToCart(product)}
                        variant="outline"
                        size="sm"
                        className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No products found.</p>
            </div>
          )}
        </section>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default HomePage;

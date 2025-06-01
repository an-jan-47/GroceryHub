import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import PopularProducts from '@/components/PopularProducts';
import ProductCard from '@/components/ProductCard';
import { toast } from '@/components/ui/sonner';
import type { CarouselApi } from '@/components/ui/carousel';
import { useQuery } from '@tanstack/react-query';
import { getProducts, searchProducts, Product } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { getBanners } from '@/services/bannerService';

const HomePage = () => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Fetch data from Supabase
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['allProducts'],
    queryFn: getProducts
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners
  });

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const results = await searchProducts(searchQuery);
        if (results && results.length > 0) {
          navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
        } else {
          toast("No products found", {
            description: "Try a different search term"
          });
        }
      } catch (error) {
        console.error('Search error:', error);
        toast("Search failed", {
          description: "Something went wrong, please try again"
        });
      }
    }
  };

  // Auto rotate banner carousel
  useEffect(() => {
    if (!banners || banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex(prevIndex => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
      carouselApi?.scrollTo(currentBannerIndex);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [carouselApi, currentBannerIndex, banners]);
  
  // Handle carousel api change
  useEffect(() => {
    if (!carouselApi) return;
    
    const onSelect = () => {
      setCurrentBannerIndex(carouselApi.selectedScrollSnap());
    };
    
    carouselApi.on("select", onSelect);
    
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);
  
  // Get featured products - first 8 items or fewer if less available
  const featuredProducts = products ? products.slice(0, 8) : [];
  
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
        {banners && banners.length > 0 && (
          <Carousel className="w-full" setApi={setCarouselApi} opts={{ startIndex: currentBannerIndex }}>
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id} className="relative">
                  <Link to={banner.link} className="block">
                    <div className="h-48 md:h-64 rounded-lg overflow-hidden relative">
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-5 flex flex-col justify-end">
                        <h3 className="text-xl font-bold text-white">{banner.title}</h3>
                        {banner.subtitle && <p className="text-sm text-white/90">{banner.subtitle}</p>}
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
              {banners.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full transition-all ${index === currentBannerIndex ? 'w-6 bg-brand-blue' : 'w-2 bg-gray-300'}`} 
                />
              ))}
            </div>
          </Carousel>
        )}
        
        {/* Google Ads Section */}
        <div className="bg-gray-100 h-20 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Ad Space</p>
        </div>
        
        {/* Most Popular Products Section */}
        <PopularProducts />
        
        {/* Categories */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Categories</h2>
            <Link to="/explore" className="text-brand-blue text-sm">See all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories?.map((category) => (
              <Link 
                to={`/explore?category=${encodeURIComponent(category.name)}`} 
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
                    {category.description && <p className="text-xs text-white/80">{category.description}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Featured Products Section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Featured Products</h2>
            <Link to="/explore" className="text-brand-blue text-sm">View All Products</Link>
          </div>
          
          {isLoadingProducts ? (
            <div className="py-8 text-center">
              <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product: Product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  showBuyNow={false}
                />
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

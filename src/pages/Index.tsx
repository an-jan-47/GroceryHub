
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

// Temporary product data
const FEATURED_PRODUCTS = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 79.99,
    image: '/placeholder.svg',
    category: 'Audio',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Smart Watch Pro',
    price: 299.99,
    salePrice: 249.99,
    image: '/placeholder.svg',
    category: 'Wearables',
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Portable Speaker',
    price: 89.99,
    image: '/placeholder.svg',
    category: 'Audio',
    rating: 4.3,
  },
  {
    id: '4',
    name: 'White Sneakers',
    price: 59.99,
    image: '/placeholder.svg',
    category: 'Fashion',
    rating: 4.1,
  },
];

const CATEGORIES = [
  { id: '1', name: 'Electronics', image: '/placeholder.svg', count: '120+ items' },
  { id: '2', name: 'Fashion', image: '/placeholder.svg', count: '210+ items' },
  { id: '3', name: 'Home & Kitchen', image: '/placeholder.svg', count: '75+ items' },
];

const BANNERS = [
  { id: '1', image: '/placeholder.svg', title: 'New Arrivals', subtitle: 'Check out our latest products' },
  { id: '2', image: '/placeholder.svg', title: 'Summer Sale', subtitle: 'Up to 50% off' },
  { id: '3', image: '/placeholder.svg', title: 'Exclusive Deals', subtitle: 'Limited time offers' },
];

const HomePage = () => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };
  
  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto space-y-6">
        {/* Hero Carousel */}
        <Carousel className="w-full">
          <CarouselContent>
            {BANNERS.map((banner) => (
              <CarouselItem key={banner.id} className="relative">
                <div className="h-48 md:h-64 rounded-lg overflow-hidden relative">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-5 flex flex-col justify-end">
                    <h3 className="text-xl font-bold text-white">{banner.title}</h3>
                    <p className="text-sm text-white/90">{banner.subtitle}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        {/* Google Ads Section */}
        <div className="bg-gray-100 h-20 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Ad Space</p>
        </div>
        
        {/* Categories */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Categories</h2>
            <Link to="/categories" className="text-brand-blue text-sm">See all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => (
              <Link 
                to={`/category/${category.id}`} 
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
            <Link to="/products" className="text-brand-blue text-sm">See all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {FEATURED_PRODUCTS.map((product) => (
              <Card key={product.id} className="product-card animate-fade-in">
                <Link to={`/product/${product.id}`}>
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="product-image"
                    />
                    {product.salePrice && (
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
                    {product.salePrice ? (
                      <div>
                        <span className="font-bold text-brand-blue">${product.salePrice.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 line-through ml-1">${product.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="font-bold">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-3 pt-0">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    variant="outline"
                    size="sm"
                    className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default HomePage;

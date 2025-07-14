import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { useCart } from '@/hooks/useCart';
import { useProductDetail } from '@/hooks/useProductDetail';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Product, CartItem } from '@/types';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart, getItemQuantity } = useCart();
  
  const { data: product, isLoading, error } = useProductDetail(id || '');

  if (isLoading) {
    return (
      <div className="pb-20">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-20">
        <Header />
        <div className="container px-4 py-8 mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
            <Link to="/" className="text-blue-600 hover:underline">
              Go back to home
            </Link>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const currentQuantity = getItemQuantity(product.id);
  const isOutOfStock = product.stock === 0;
  const discount = product.sale_price ? 
    Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast('Product is out of stock');
      return;
    }

    const cartItem = {
      ...product,
      quantity: quantity
    } as CartItem;

    addToCart(cartItem, quantity);
    toast('Added to cart!', {
      description: `${quantity} x ${product.name} added to your cart.`
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto max-w-4xl">
        <div className="flex items-center mb-4">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Products
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <div className="mb-4">
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.review_count} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                {product.sale_price ? (
                  <>
                    <span className="text-3xl font-bold text-green-600">
                      ₹{product.sale_price.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {discount}% OFF
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold">
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Stock: {product.stock} available
              </p>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
                {product.features && product.features.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isOutOfStock ? 'Out of Stock' : `Add to Cart - ₹${((product.sale_price || product.price) * quantity).toFixed(2)}`}
              </Button>

              {currentQuantity > 0 && (
                <p className="text-sm text-green-600 text-center">
                  {currentQuantity} item(s) in cart
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ProductDetail;

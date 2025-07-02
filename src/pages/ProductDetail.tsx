
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  
  // Mock product data - replace with actual data fetching
  const product = {
    id: id || '',
    name: 'Sample Product',
    price: 100,
    description: 'This is a sample product',
    image: '/placeholder.jpg',
    created_at: new Date().toISOString(),
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
  };

  const deliveryDate = product.created_at ? new Date(product.created_at) : new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-green-600 mb-4">
                ₹{product.price}
              </p>
              <p className="text-gray-600 mb-6">
                {product.description}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Expected delivery: {deliveryDate.toLocaleDateString()}
              </p>
              
              <Button onClick={handleAddToCart} className="w-full">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

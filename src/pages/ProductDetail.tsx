import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '@/types';
import { getProductById, getSimilarProducts } from '@/services/productService';
import ProductsGrid from '@/components/ProductsGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (productId) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  const fetchProductDetails = async (id: string) => {
    try {
      setLoading(true);
      const productData = await getProductById(id);
      if (productData) {
        setProduct(productData);
        fetchSimilarProducts(productData.category, productData.brand || '');
        fetchReviews(id);
      } else {
        console.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async (category: string, brand: string) => {
    if (productId) {
      try {
        const similar = await getSimilarProducts(productId, category, brand);
        setSimilarProducts(similar);
      } catch (error) {
        console.error('Error fetching similar products:', error);
      }
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      // Fetch reviews logic here
      setReviews([]); // Replace with actual reviews
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast(`${quantity} ${product.name} added to cart`);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return <div>Loading product details...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={product.images?.[0]} alt={product.name} className="w-full rounded-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="text-gray-500">{product.rating}</span>
          </div>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xl font-semibold">₹{product.salePrice || product.price}</span>
            {product.salePrice && (
              <span className="text-gray-500 line-through">₹{product.price}</span>
            )}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border rounded-md">
              <Button onClick={decrementQuantity} className="px-4 py-2">-</Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-16 text-center"
              />
              <Button onClick={incrementQuantity} className="px-4 py-2">+</Button>
            </div>
            {product.stock ? (
              <span className="text-green-500">In Stock</span>
            ) : (
              <span className="text-red-500">Out of Stock</span>
            )}
          </div>
          <Button onClick={handleAddToCart} className="w-full">Add to Cart</Button>
          {user ? (
            <Link to={`/write-review/${productId}`} className="block mt-4 text-blue-500">
              Write a Review
            </Link>
          ) : (
            <Button variant="link" onClick={() => navigate('/login')} className="w-full mt-4">
              Login to Write a Review
            </Button>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-lg mb-4">Customer Reviews</h3>
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 mb-4 last:border-b-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="font-medium">{review.user_name}</span>
                <span className="text-gray-500 text-sm">
                  {review.date ? new Date(review.date).toLocaleDateString() : ''}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      {similarProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Similar Products</h2>
          <ProductsGrid products={similarProducts} />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

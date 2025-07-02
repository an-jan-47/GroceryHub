
import { useState, useEffect } from 'react';

export function useUserProductPurchases(productIds: string[]) {
  const [purchasedProducts, setPurchasedProducts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock implementation - replace with actual API call
    const mockPurchasedProducts = new Set(['product1', 'product2']);
    setPurchasedProducts(mockPurchasedProducts);
    setIsLoading(false);
  }, [productIds]);

  const hasUserPurchased = (productId: string) => {
    return purchasedProducts.has(productId);
  };

  return {
    hasUserPurchased,
    isLoading
  };
}

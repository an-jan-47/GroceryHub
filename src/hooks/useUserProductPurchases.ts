
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to check if the current user has purchased specific products
 */
export const useUserProductPurchases = (productIds: string[]) => {
  const { user } = useAuth();
  const [purchasedProducts, setPurchasedProducts] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user || productIds.length === 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get all of user's order items
        const { data: orderItems, error } = await supabase
          .from('order_items')
          .select(`
            product_id,
            order_id,
            orders:orders(status)
          `)
          .in('product_id', productIds)
          .eq('orders.user_id', user.id);
          
        if (error) throw error;
        
        const purchased: Record<string, boolean> = {};
        
        // Consider a product purchased if it appears in a completed order
        orderItems?.forEach((item: any) => {
          const status = item.orders?.status;
          if (status && (status === 'Delivered' || status === 'Shipped')) {
            purchased[item.product_id] = true;
          }
        });
        
        setPurchasedProducts(purchased);
      } catch (error) {
        console.error('Error fetching purchase history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPurchases();
  }, [user, JSON.stringify(productIds)]);
  
  const hasUserPurchased = (productId: string): boolean => {
    return !!purchasedProducts[productId];
  };
  
  return {
    hasUserPurchased,
    isLoading
  };
};

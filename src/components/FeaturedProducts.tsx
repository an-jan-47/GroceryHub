
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductsGrid from './ProductsGrid';

const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(8);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
      <ProductsGrid products={products} isLoading={isLoading} />
    </div>
  );
};

export default FeaturedProducts;

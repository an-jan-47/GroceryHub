
import { useQuery } from '@tanstack/react-query';
import { searchProducts, SearchFiltersType } from '@/services/searchService';

export const useSearchProducts = (filters: SearchFiltersType) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => searchProducts(filters),
  });
};

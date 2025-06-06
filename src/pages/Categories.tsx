
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import CategoryCard from '@/components/CategoryCard';
import { getCategories } from '@/services/categoryService';

const Categories = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-6 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Shop by Categories</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-square"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
        
        {!isLoading && categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No categories available</p>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Categories;

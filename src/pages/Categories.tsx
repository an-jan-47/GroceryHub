
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/searchService';

const Categories = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['all-categories'],
    queryFn: getCategories,
  });

  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="py-3 flex items-center">
          <Link to="/" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">All Categories</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/explore?category=${encodeURIComponent(category.name)}`}
                className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow border"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-20 h-20 mx-auto mb-3 object-contain"
                />
                <h3 className="font-medium text-sm">{category.name}</h3>
                {category.description && (
                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Categories;

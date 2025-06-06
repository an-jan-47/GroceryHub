
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    image: string;
    description?: string;
  };
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link 
      to={`/explore?category=${encodeURIComponent(category.name)}`}
      className="block relative overflow-hidden rounded-lg aspect-square group transition-transform duration-300 hover:scale-105"
    >
      <img 
        src={category.image} 
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      
      {/* Text content positioned at bottom left */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="backdrop-blur-sm bg-black/30 rounded-lg p-3">
          <h3 className="text-white font-semibold text-lg leading-tight">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-white/80 text-sm mt-1 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;

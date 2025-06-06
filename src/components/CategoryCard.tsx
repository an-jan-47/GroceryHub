
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    image: string;
    description?: string;
  };
}

const CategoryCard = ({ category }) => (
  <Link
    to={`/explore?category=${encodeURIComponent(category.name)}`}
    className="block group"
  >
    <div className="relative overflow-hidden rounded-lg bg-gray-100 transition-all duration-300 group-hover:shadow-lg">
      <div className="aspect-square">
        <img
          src={category.image || '/placeholder.svg'}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
        <div className="absolute bottom-0 p-4 text-white">
          <h3 className="text-lg font-semibold">{category.name}</h3>
          <p className="text-sm opacity-90">{category.description}</p>
        </div>
      </div>
    </div>
  </Link>
);

export default CategoryCard;


import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/services/categoryService';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/explore?category=${encodeURIComponent(category.name)}`}
      className="group block"
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
            <h3 className="font-semibold">{category.name}</h3>
            {category.description && (
              <p className="text-sm opacity-90">{category.description}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

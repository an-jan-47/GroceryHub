
import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: '1', name: 'Fruits', image: '/placeholder-fruit.jpg' },
  { id: '2', name: 'Vegetables', image: '/placeholder-vegetable.jpg' },
  { id: '3', name: 'Dairy', image: '/placeholder-dairy.jpg' },
  { id: '4', name: 'Snacks', image: '/placeholder-snacks.jpg' },
];

const CategoriesSection = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">Shop by Category</h2>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => navigate(`/search?category=${category.name}`)}
            className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="h-20 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
              <span className="text-gray-500">{category.name}</span>
            </div>
            <p className="text-center font-medium">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;


import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mx-4 mt-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Welcome to GroceryHub</h1>
        <p className="text-blue-100">Fresh groceries delivered to your doorstep</p>
        <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
          Shop Now
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;

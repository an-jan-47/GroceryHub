
import * as React from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to GroceryHub
          </h1>
          <p className="text-gray-600">
            Find fresh groceries delivered to your doorstep
          </p>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Home;
